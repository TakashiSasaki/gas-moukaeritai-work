/**
 * Code.gs
 * アプリケーションのメインロジック（Drive操作、AI判定実行）
 * アプリ名: Web Clip Stash
 * * 更新: Gemini APIのgenerationConfigに temperature: 0.0 を追加し、判定の揺らぎを抑制
 */

// ==========================================
// 1. ファイル取得 API
// ==========================================

function getRecentCandidates(limit) {
  try {
    const fetchLimit = Math.min(Number(limit) || 10, 100);
    const currentUserEmail = Session.getActiveUser().getEmail();
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - CONFIG.DAYS_TO_WAIT);

    // 1. DriveAppで基本検索（イテレータ）
    const query = `trashed = false and 'root' in parents and not fullText contains '${CONFIG.CHECKED_TAG}' and (mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/pdf' or mimeType = 'text/plain')`;
    const filesIter = DriveApp.searchFiles(query);
    
    const tempCandidates = [];
    const MAX_SCAN = Math.max(50, fetchLimit * 5);
    let count = 0;

    while (filesIter.hasNext() && count < MAX_SCAN) {
      const file = filesIter.next();
      if (file.getName() === CONFIG.TARGET_FOLDER_NAME) continue;

      try {
        const owner = file.getOwner();
        if (!owner || owner.getEmail() !== currentUserEmail) continue;
        if (file.getLastUpdated() > dateThreshold) continue;

        tempCandidates.push({
          id: file.getId(),
          name: file.getName(),
          url: file.getUrl(),
          mimeType: file.getMimeType(),
          lastUpdated: file.getLastUpdated().getTime(),
          size: file.getSize(),
          thumbnailLink: null // 初期値
        });
        count++;
      } catch (e) { console.warn("Skip error:", e); }
    }

    // 更新日順ソート & 件数カット
    tempCandidates.sort((a, b) => b.lastUpdated - a.lastUpdated);
    const finalCandidates = tempCandidates.slice(0, fetchLimit);

    // 2. Drive API v3 を使ってサムネイルを一括取得
    if (finalCandidates.length > 0) {
      finalCandidates.forEach(candidate => {
        try {
          // Drive API v3: Drive.Files.get(fileId, optionalArgs)
          const driveFile = Drive.Files.get(candidate.id, { fields: "thumbnailLink" });
          if (driveFile && driveFile.thumbnailLink) {
            candidate.thumbnailLink = driveFile.thumbnailLink;
          }
        } catch (e) {
          console.warn(`Thumbnail fetch failed for ${candidate.name}: ${e.message}`);
        }
      });
    }

    return finalCandidates;

  } catch (e) {
    throw new Error(`ファイル取得中にエラーが発生しました: ${e.message}`);
  }
}

// ==========================================
// 2. AI判定 API (バッチ処理)
// ==========================================

function predictFilesBatch(fileIds) {
  const apiKey = CONFIG.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("APIキーが設定されていません。スクリプトプロパティ 'GEMINI_API_KEY' を設定してください。");
  }

  const currentKeepKeywords = getKeepKeywords();
  const requests = [];
  const fileDataList = [];

  fileIds.forEach(id => {
    try {
      const file = DriveApp.getFileById(id);
      const isForceKeep = currentKeepKeywords.some(k => file.getName().includes(k));

      if (isForceKeep) {
        fileDataList.push({ id: id, skipAi: true, decision: "KEEP", reason: "Keyword Match" });
      } else {
        const fileContent = extractFileContent(file);
        const payload = createGeminiPayload(file.getName(), fileContent);
        
        requests.push({
          url: `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODEL_NAME}:generateContent?key=${apiKey}`,
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });
        fileDataList.push({ id: id, skipAi: false });
      }
    } catch (e) {
      fileDataList.push({ id: id, error: true, decision: "ERROR", reason: `Read Error: ${e.message}` });
    }
  });

  if (requests.length === 0) {
    return fileDataList.map(d => ({
      id: d.id, 
      decision: d.decision || "KEEP", 
      reason: d.reason || "Skipped"
    }));
  }

  let responses;
  try {
    responses = UrlFetchApp.fetchAll(requests);
  } catch (e) {
    throw new Error(`Gemini API Request Failed: ${e.message}`);
  }
  
  let responseIndex = 0;
  return fileDataList.map(data => {
    if (data.error || data.skipAi) {
      return { id: data.id, decision: data.decision, reason: data.reason };
    }

    const resp = responses[responseIndex++];
    const respCode = resp.getResponseCode();
    
    if (respCode !== 200) {
      let errorMsg = `API Error (${respCode})`;
      try {
        const errJson = JSON.parse(resp.getContentText());
        if (errJson.error && errJson.error.message) {
          errorMsg += `: ${errJson.error.message}`;
        }
      } catch (e) { }
      return { id: data.id, decision: "ERROR", reason: errorMsg };
    }
    
    try {
      const json = JSON.parse(resp.getContentText());
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || "KEEP";
      const decision = text.includes("MOVE") ? "MOVE" : "KEEP";
      return { id: data.id, decision: decision, reason: "AI Predicted" };
    } catch (e) {
      return { id: data.id, decision: "ERROR", reason: "Parse Error" };
    }
  });
}

// ==========================================
// 3. 移動実行 API
// ==========================================

function moveFilesBatch(fileIds) {
  try {
    const targetFolder = getOrCreateFolder(CONFIG.TARGET_FOLDER_NAME);
    const results = [];

    fileIds.forEach(id => {
      try {
        const file = DriveApp.getFileById(id);
        file.moveTo(targetFolder);
        results.push({ id: id, success: true });
      } catch (e) {
        results.push({ id: id, success: false, error: e.message });
      }
    });
    
    return results;
  } catch (e) {
    throw new Error(`フォルダへのアクセスまたは作成に失敗しました: ${e.message}`);
  }
}

// ==========================================
// ヘルパー関数
// ==========================================

function extractFileContent(file) {
  const mimeType = file.getMimeType();
  const name = file.getName();
  
  if (mimeType === MimeType.GOOGLE_DOCS) {
    return {
      type: "text",
      content: DocumentApp.openById(file.getId()).getBody().getText().substring(0, 8000)
    };
  } else if (mimeType === MimeType.PLAIN_TEXT || name.toLowerCase().endsWith(".md")) {
    return {
      type: "text",
      content: file.getBlob().getDataAsString().substring(0, 8000)
    };
  } else {
    return {
      type: "blob",
      mimeType: mimeType,
      content: Utilities.base64Encode(file.getBlob().getBytes())
    };
  }
}

function createGeminiPayload(fileName, fileData) {
  const promptText = generateSystemPrompt(fileName);

  let parts = [{text: promptText}];

  if (fileData.type === "text") {
    parts.push({text: "Content:\n" + fileData.content});
  } else {
    parts.push({
      inline_data: { mime_type: fileData.mimeType, data: fileData.content }
    });
  }
  
  return { 
    contents: [{ parts: parts }],
    // 【重要】出力のランダム性を排除し、判定を安定させる
    generationConfig: {
      temperature: 0.0
    }
  };
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getRootFolder().getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    return folders.next();
  }
  
  const newFolder = DriveApp.getRootFolder().createFolder(folderName);
  
  let appUrl = "（未デプロイ/不明）";
  try {
    appUrl = ScriptApp.getService().getUrl();
  } catch (e) { }

  const description = 
    `【Web Clip Stash 自動生成フォルダ】\n` +
    `作成日: ${new Date().toLocaleDateString()}\n` +
    `管理アプリURL: ${appUrl}\n\n` +
    `このフォルダは、Web Clip Stash によってマイドライブから退避されたWebクリップ・一時ファイルを保管する場所です。`;
  newFolder.setDescription(description);

  try { newFolder.setColor(DriveApp.Color.GRAY); } catch (e) { }

  try {
    const readmeTitle = "00_READ_ME (About Web Clip Stash)";
    const doc = DocumentApp.create(readmeTitle);
    const body = doc.getBody();
    
    body.insertParagraph(0, "📁 Web Clip Stash Inbox").setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph("このフォルダは、自動整理ツール「Web Clip Stash」によって生成されました。");
    body.appendParagraph("\n⚙️ 管理コンソール").setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const linkPara = body.appendParagraph(appUrl);
    linkPara.setLinkUrl(appUrl);
    body.appendParagraph("\n⚠️ 仕様メモ").setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph(`・最終更新から ${CONFIG.DAYS_TO_WAIT}日以内のファイルは作業中とみなされ、移動されません。`);
    
    doc.saveAndClose();
    const docFile = DriveApp.getFileById(doc.getId());
    docFile.moveTo(newFolder);
  } catch (e) { }
  
  return newFolder;
}
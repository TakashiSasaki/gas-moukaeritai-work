const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

/**
 * 指定されたファイルのタイトル案をGemini APIを使用して生成します。
 * @param {string} fileId - 対象となるファイルのID。
 * @param {string} titleCount - 生成するタイトル数（クライアントから渡される）。
 * @returns {string} Geminiが生成したタイトル候補（Markdownリスト形式）。
 */
function generateTitlesForFile(fileId, titleCount) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini APIキーが設定されていません。スクリプトプロパティを確認してください。');
  }
  
  const count = parseInt(titleCount, 10);
  if (isNaN(count) || count < 1 || count > 5) {
    throw new Error('無効なタイトル数です。1から5の間で指定してください。');
  }
  const promptText = `この文書の全体を読んで、内容を的確に表す日本語のタイトルを${count}つ考えてください。考えたタイトルだけを、余計な説明を付けずにマークダウンの箇条書きで出力してください。`;

  const geminiFile = uploadToGeminiById(fileId);

  const generationConfig = {
    temperature: 0.8,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
  };

  const data = {
    generationConfig,
    contents: [{
      role: 'user',
      parts: [
        { fileData: { fileUri: geminiFile.uri, mimeType: geminiFile.mimeType } },
        { text: promptText },
      ],
    }],
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(data),
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseData = JSON.parse(response.getContentText());
  
  if (responseData.candidates && responseData.candidates[0].content) {
    return responseData.candidates[0].content.parts[0].text;
  } else {
    console.error("Gemini APIからの予期せぬレスポンス:", responseData);
    throw new Error('タイトルの生成に失敗しました。Gemini APIのレスポンスが不正です。');
  }
}

/**
 * ファイル名を変更します。
 * @param {string} fileId - 対象ファイルのID。
 * @param {string} newTitle - 新しいファイル名。
 */
function renameFile(fileId, newTitle) {
  try {
    const file = DriveApp.getFileById(fileId);
    file.setName(newTitle);
  } catch (e) {
    console.error(e);
    throw new Error('ファイル名の変更に失敗しました。');
  }
}

/**
 * タイトルを1つ生成し、即座にファイル名を変更する。
 * @param {string} fileId - 対象ファイルのID。
 * @returns {string} 変更後の新しいファイル名。
 */
function generateAndRenameFile(fileId) {
  // 既存の関数を呼び出してタイトルを1つ生成
  const titleSuggestions = generateTitlesForFile(fileId, '1');
  
  // 生成されたタイトルを整形（最初の1行を取得）
  const newTitle = titleSuggestions.replace(/[-*]/g, '').trim().split('\n')[0].trim();

  if (!newTitle) {
    throw new Error('タイトルの生成に失敗しました。');
  }

  // 既存の関数を呼び出してファイル名を変更
  renameFile(fileId, newTitle);

  // UI更新のため、新しいファイル名を返す
  return newTitle;
}


// --- 以下、Gemini API連携用のヘルパー関数 ---

/**
 * ファイルIDを使ってDriveからファイルを取得し、Geminiにアップロードします。
 * @param {string} fileId - Google Drive上のファイルのID。
 * @return {Object} アップロードされたファイルのURIやMIMEタイプなど。
 */
function uploadToGeminiById(fileId) {
  const file = DriveApp.getFileById(fileId);
  if (!file) {
    throw new Error(`Error: File with ID "${fileId}" not found in Drive.`);
  }

  const blob = file.getBlob();
  const url = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`;
  const options = {
    method: 'POST',
    payload: blob,
    headers: {
      'x-goog-upload-protocol': 'raw',
      'Content-Type': blob.getContentType(),
    },
  };

  const uploadResponse = UrlFetchApp.fetch(url, options);
  let geminiFile = JSON.parse(uploadResponse.getContentText()).file;
  
  // ファイルの処理が完了するまで待機
  while (geminiFile.state === 'PROCESSING') {
    Utilities.sleep(3000); // 3秒待機
    const stateUrl = `https://generativelanguage.googleapis.com/v1beta/${geminiFile.name}?key=${GEMINI_API_KEY}`;
    const stateResponse = UrlFetchApp.fetch(stateUrl, { method: 'GET' });
    geminiFile = JSON.parse(stateResponse.getContentText()).file;
  }

  if (geminiFile.state !== 'ACTIVE') {
    throw new Error(`Error: File ${file.getName()} failed to process in Gemini.`);
  }

  return geminiFile;
}
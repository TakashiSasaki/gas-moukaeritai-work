/**
 * ユーザープロパティからAPIキーを保存する
 * @param {string} apiKey - 保存するGoogle AI StudioのAPIキー
 */
function saveApiKey(apiKey) {
  try {
    PropertiesService.getUserProperties().setProperty('GEMINI_API_KEY', apiKey);
    return { success: true, message: 'APIキーを保存しました。' };
  } catch (e) {
    console.error('APIキーの保存に失敗:', e);
    return { success: false, message: `エラー: ${e.message}` };
  }
}

/**
 * ユーザープロパティからAPIキーを読み込む
 * @returns {string} - 保存されているAPIキー
 */
function getApiKey() {
  try {
    return PropertiesService.getUserProperties().getProperty('GEMINI_API_KEY') || '';
  } catch (e) {
    console.error('APIキーの読み込みに失敗:', e);
    return '';
  }
}

/**
 * フォルダIDとフィルタパターンを保存する
 * @param {object} preferences - { folderId: "...", filterPatterns: "..." }
 */
function saveUserPreferences(preferences) {
  try {
    PropertiesService.getUserProperties().setProperties(preferences);
  } catch (e) {
    console.error('ユーザー設定の保存に失敗:', e);
  }
}

/**
 * フィルタリングパターンのみを保存する
 * @param {string} patterns - 保存するフィルタリングパターンの文字列
 */
function saveFilterPatternsOnly(patterns) {
  try {
    PropertiesService.getUserProperties().setProperty('filterPatterns', patterns);
  } catch (e) {
    console.error('フィルタリングパターンの保存に失敗:', e);
  }
}

/**
 * 保存されているユーザー設定を読み込む
 * @returns {object} - { folderId: string, filterPatterns: string|null }
 */
function getUserPreferences() {
  try {
    const properties = PropertiesService.getUserProperties().getProperties();
    return {
      folderId: properties.folderId || '',
      filterPatterns: properties.filterPatterns !== undefined ? properties.filterPatterns : null
    };
  } catch (e) {
    console.error('ユーザー設定の読み込みに失敗:', e);
    return { folderId: '', filterPatterns: null };
  }
}

/**
 * 実行ユーザーのメールアドレスを取得する
 * @returns {string} ユーザーのメールアドレス
 */
function getUserEmail() {
  return Session.getActiveUser().getEmail();
}


// Webアプリケーションのメインエントリーポイント
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Googleドライブフォルダ内ファイル名生成＆一括リネーム')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// HTMLテンプレート内で他のHTMLファイルをインクルードするためのヘルパー関数
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * ★変更: 指定されたフォルダ内のファイル情報と、キャッシュにあればサムネイルも取得する
 * @param {string} folderId - GoogleドライブのフォルダID
 * @returns {Array<Object>} - ファイル情報の配列 {id, name, dateCreated, mimeType, thumbnailDataUrl}
 */
function getFilesFromFolder(folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const allFiles = [];
    const cache = CacheService.getUserCache();

    while (files.hasNext()) {
      const file = files.next();
      const fileId = file.getId();
      const cacheKey = 'thumbV3_' + fileId;
      
      // ★変更: ファイルリスト取得時にキャッシュを確認
      const thumbnailDataUrl = cache.get(cacheKey);

      allFiles.push({
        id: fileId,
        name: file.getName(),
        dateCreated: file.getDateCreated().toISOString(),
        mimeType: file.getMimeType(),
        thumbnailDataUrl: thumbnailDataUrl // キャッシュがあればURLが、なければnullが入る
      });
    }
    
    allFiles.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    return allFiles;
  } catch (e) {
    console.error(`フォルダ[${folderId}]の取得に失敗: ${e.toString()}`);
    throw new Error(`フォルダIDが無効か、アクセス権がありません。詳細: ${e.message}`);
  }
}

/**
 * 指定されたファイルIDのサムネイルを取得（キャッシュ利用）
 * @param {string} fileId - ファイルのID
 * @returns {string|null} - サムネイルのBase64データURL、またはnull
 */
function getThumbnailDataUrl(fileId) {
  const cache = CacheService.getUserCache();
  const cacheKey = 'thumbV3_' + fileId;
  let thumbnailDataUrl = cache.get(cacheKey);

  if (thumbnailDataUrl === null) {
    try {
      const fileMetadata = Drive.Files.get(fileId, { fields: "thumbnailLink" });
      const thumbnailUrl = fileMetadata.thumbnailLink;
      
      if (thumbnailUrl) {
        const response = UrlFetchApp.fetch(thumbnailUrl, {
          headers: {
            Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
          }
        });
        const thumbnailBlob = response.getBlob();
        thumbnailDataUrl = `data:${thumbnailBlob.getContentType()};base64,${Utilities.base64Encode(thumbnailBlob.getBytes())}`;
        cache.put(cacheKey, thumbnailDataUrl, 21600);
      }
    } catch (e) {
      console.log(`Drive APIでのサムネイル取得失敗: fileId=${fileId}, エラー: ${e.message}`);
      thumbnailDataUrl = null;
    }
  } else {
    console.log(`サムネイルをキャッシュから取得: fileId=${fileId}`);
  }
  return thumbnailDataUrl;
}


/**
 * ファイルの内容からGeminiを使って新しいタイトルを提案させる（キャッシュ機能付き）
 * @param {string} fileId - ファイルのID
 * @returns {string} - 提案された新しいファイル名
 */
function getSuggestedTitle(fileId) {
  const cache = CacheService.getUserCache();
  const cachedTitle = cache.get(fileId);
  if (cachedTitle !== null) {
    console.log(`[サーバー] キャッシュからタイトルを返却: fileId=${fileId}, title=${cachedTitle}`);
    return cachedTitle;
  }

  console.log(`[サーバー] getSuggestedTitle開始 (キャッシュなし): fileId=${fileId}`);
  const GEMINI_API_KEY = getApiKey();
  if (!GEMINI_API_KEY) {
    console.error('[サーバー] APIキーが設定されていません。');
    throw new Error("APIキーが設定されていません。設定画面からAPIキーを登録してください。");
  }

  try {
    const file = DriveApp.getFileById(fileId);
    const mimeType = file.getMimeType();
    const blob = file.getBlob();
    let payload;

    const prompt = `あなたは、ファイルの内容を分析し、最も的確なファイル名を生成する専門家です。
以下のルールに従って、与えられたファイルからファイル名を生成してください。

# ルール
- ファイル名は、内容の核心を突く最も重要なキーワードや固有名詞を必ず含めてください。
- 日付、会議名、プロジェクト名、製品名などが含まれる場合は、それらを優先的に使用してください。
- ファイル名は25文字以内の日本語のフレーズにしてください。
- 説明文、前置き、記号（「」や【】）、拡張子は絶対に出力しないでください。
- 生成するのはファイル名そのものだけです。他の余計なテキストは一切含めないでください。

# ファイル名:`;

    if (mimeType === MimeType.PDF) {
      const pdfBytes = blob.getBytes();
      const pdfBase64 = Utilities.base64Encode(pdfBytes);
      payload = { "contents": [{ "parts": [ { "text": prompt }, { "inlineData": { "mimeType": "application/pdf", "data": pdfBase64 } } ] }] };
    } else {
      let content = '';
      switch (mimeType) {
        case MimeType.GOOGLE_DOCS: content = DocumentApp.openById(fileId).getBody().getText(); break;
        case MimeType.PLAIN_TEXT: case 'text/markdown': content = blob.getDataAsString('UTF-8'); break;
        default: return `(サポート外MIMEタイプ: ${mimeType})`;
      }
      
      if (content.trim().length === 0) return "(内容が空です)";
      if (content.length > 5000) content = content.substring(0, 5000);
      
      const textPrompt = `あなたは、ファイルの内容を分析し、最も的確なファイル名を生成する専門家です。
以下のルールに従って、与えられたテキストからファイル名を生成してください。

# ルール
- ファイル名は、内容の核心を突く最も重要なキーワードや固有名詞を必ず含めてください。
- 日付、会議名、プロジェクト名、製品名などが含まれる場合は、それらを優先的に使用してください。
- ファイル名は25文字以内の日本語のフレーズにしてください。
- 説明文、前置き、記号（「」や【】）、拡張子は絶対に出力しないでください。
- 生成するのはファイル名そのものだけです。他の余計なテキストは一切含めないでください。

# テキスト
---
${content}
---

# ファイル名:`;
      
      payload = { "contents": [{ "parts": [{ "text": textPrompt }] }] };
    }
    
    payload.generationConfig = { "temperature": 0.3, "topK": 1, "topP": 1, "maxOutputTokens": 50 };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
    const options = { 'method': 'post', 'contentType': 'application/json', 'payload': JSON.stringify(payload), 'muteHttpExceptions': true };

    console.log('[サーバー] Gemini APIへのリクエストを送信します...');
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();
    console.log(`[サーバー] Gemini APIからレスポンスを受信しました。ステータスコード: ${responseCode}`);

    if (responseCode !== 200) {
       console.error("[サーバー] Gemini APIエラー:", responseBody);
       throw new Error(`Gemini APIエラー (コード: ${responseCode})。APIキーが正しいか確認してください。`);
    }
    
    const data = JSON.parse(responseBody);
    
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
      let suggestedName = data.candidates[0].content.parts[0].text;
      suggestedName = suggestedName.replace(/^ファイル名:/, '').replace(/["`]/g, '').replace(/\.md$/, '').trim();
      console.log(`[サーバー] タイトル生成成功: "${suggestedName}"`);
      cache.put(fileId, suggestedName, 600);
      return suggestedName;
    } else {
      console.error("[サーバー] Geminiからの予期せぬレスポンス:", JSON.stringify(data, null, 2));
      return "(タイトル生成エラー)";
    }

  } catch (e) {
    console.error(`[サーバー] getSuggestedTitleで致命的なエラーが発生: ${e.toString()}`, e.stack);
    return `(エラー: ${e.message})`;
  }
}


/**
 * ファイル名を変更する
 * @param {string} fileId - ファイルID
 * @param {string} newName - 新しいファイル名
 * @returns {string} - 成功または失敗のメッセージ
 */
function renameFile(fileId, newName) {
  try {
    const file = DriveApp.getFileById(fileId);
    const originalName = file.getName();
    const extensionMatch = originalName.match(/\.([^.]+)$/);
    let finalName = newName;
    if (extensionMatch && !newName.endsWith(extensionMatch[0])) {
      finalName = `${newName}${extensionMatch[0]}`;
    }
    file.setName(finalName);
    console.log(`ファイル[${fileId}]を「${finalName}」にリネームしました。`);
    return `リネーム成功: ${finalName}`;
  } catch (e) {
    console.error(`ファイル[${fileId}]のリネームに失敗: ${e.toString()}`);
    return `エラー: ${e.message}`;
  }
}

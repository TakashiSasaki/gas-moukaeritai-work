/**
 * @fileoverview
 * Gemini APIを利用してDNS設定のスクリーンショットやテキストデータからレコードを抽出するコアロジック。
 *
 * @version 3.0.0
 * --- 変更履歴 ---
 * v3.0.0 (2025-06-21):
 * - テキストデータからDNSレコードを抽出する機能を追加 (extractDnsRecordsFromText)。
 * - テキスト解析に特化した新しいプロンプトを追加 (getPromptForText)。
 * v2.0.0:
 * - ファイルアップロードの並列化、完了後のファイル自動削除、プロンプト強化。
 */

// --- Configuration ---
const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
if (!apiKey) {
  throw new Error('GEMINI_API_KEYがスクリプトプロパティに設定されていません。');
}


// =================================================================
// WEB APPLICATION BACKEND
// =================================================================

/**
 * [Web App用] 複数の画像ファイルからDNSレコードを抽出します。
 * @param {string[]} arrayOfBase64Data 画像ファイルのData URLの配列。
 * @param {string[]} arrayOfMimeTypes 画像のMIMEタイプの配列。
 * @param {string[]} arrayOfFileNames 元のファイル名の配列。
 * @return {string} 抽出されたDNSレコードのJSON文字列。
 */
function extractDnsRecordsFromImages(arrayOfBase64Data, arrayOfMimeTypes, arrayOfFileNames) {
  // (v2.0.0からの変更なし、以前のコードをそのまま利用)
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error('サーバーが現在他のリクエストを処理中です。しばらく待ってからもう一度お試しください。');
  }

  const uploadedFiles = [];
  try {
    const startTime = new Date();
    Logger.log(`[Image START] ${startTime.toLocaleTimeString()}: Execution for ${arrayOfFileNames.length} files.`);

    const uploadRequests = arrayOfBase64Data.map((base64, i) => {
      const pureBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
      const blob = Utilities.newBlob(Utilities.base64Decode(pureBase64), arrayOfMimeTypes[i], arrayOfFileNames[i]);
      const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`;
      return { url: uploadUrl, method: 'POST', headers: { 'X-Goog-Upload-Protocol': 'raw', 'Content-Type': blob.getContentType() }, payload: blob.getBytes(), muteHttpExceptions: true };
    });

    const uploadResponses = UrlFetchApp.fetchAll(uploadRequests);
    uploadResponses.forEach((response, i) => {
      if (response.getResponseCode() !== 200) throw new Error(`File upload failed for "${arrayOfFileNames[i]}". Response: ${response.getContentText()}`);
      uploadedFiles.push(JSON.parse(response.getContentText()).file);
    });
    
    const prompt = getPromptForImage();
    const parts = [{ text: prompt }];
    uploadedFiles.forEach(file => parts.push({ fileData: { mimeType: file.mimeType, fileUri: file.uri } }));

    return callGeminiAPI(parts);

  } catch (e) {
    Logger.log(`[Image ERROR] ${e.stack}`);
    throw new Error(`Server-side error (Image): ${e.message}`);
  } finally {
    if (uploadedFiles.length > 0) {
       uploadedFiles.forEach(file => {
         try { deleteGeminiFile(file.name); } catch (err) { Logger.log(`[Cleanup] Failed to delete file ${file.name}. Error: ${err.message}`); }
       });
    }
    lock.releaseLock();
    Logger.log('[Image] Lock released.');
  }
}

/**
 * [Web App用] テキストデータからDNSレコードを抽出します。
 * @param {string} textContent DNSレコード情報を含むテキスト。
 * @return {string} 抽出されたDNSレコードのJSON文字列。
 */
function extractDnsRecordsFromText(textContent) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error('サーバーが現在他のリクエストを処理中です。しばらく待ってからもう一度お試しください。');
  }
  
  try {
    const startTime = new Date();
    Logger.log(`[Text START] ${startTime.toLocaleTimeString()}: Execution for text block (length: ${textContent.length}).`);
    if (!textContent || textContent.trim() === '') {
        return '[]'; // Return empty array if text is empty.
    }

    const prompt = getPromptForText();
    const parts = [{ text: `${prompt}\n\n# 解析対象のテキスト:\n\`\`\`\n${textContent}\n\`\`\`` }];
    
    return callGeminiAPI(parts);

  } catch (e) {
    Logger.log(`[Text ERROR] ${e.stack}`);
    throw new Error(`Server-side error (Text): ${e.message}`);
  } finally {
    lock.releaseLock();
    Logger.log('[Text] Lock released.');
  }
}

// =================================================================
// CORE & HELPER FUNCTIONS
// =================================================================

/**
 * Gemini APIを呼び出す共通関数。
 * @param {Array<Object>} parts APIに送信するparts配列。
 * @return {string} APIから返されたテキストコンテンツ。
 */
function callGeminiAPI(parts) {
  const generationConfig = { temperature: 0.1, responseMimeType: 'application/json' };
  const data = { generationConfig, contents: [{ role: 'user', parts: parts }] };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(data),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode !== 200) {
    throw new Error(`API request failed with status code ${responseCode}. Response: ${responseText}`);
  }
  
  const responseObject = JSON.parse(responseText);
  if (!responseObject.candidates || responseObject.candidates.length === 0 || !responseObject.candidates[0].content) {
     const blockReason = responseObject.promptFeedback?.blockReason;
     if (blockReason) throw new Error(`Request was blocked due to: ${blockReason}.`);
    throw new Error('Invalid API response: "candidates" field is missing or empty.');
  }
  
  return responseObject.candidates[0].content.parts[0].text;
}


/**
 * 画像解析用のプロンプトを生成します。
 * @return {string} プロンプトテキスト。
 */
function getPromptForImage() {
  return `
添付された画像は、DNS管理画面のスクリーンショットです。これらの画像からOCRを実行し、表示されている全てのDNSレコードを抽出してください。

# 指示
1.  **抽出フィールド:** 各レコードについて、以下のフィールドを特定してください。
    * \`type\`: レコードのタイプ (例: A, CNAME, MX, TXT, NS, AAAA, SRV, CAA)。
    * \`hostname\`: ホスト名（または名前、サブドメイン）。\`@\` もそのまま \`@\` として抽出してください。
    * \`value\`: 値（または内容、データ、参照先）。
    * \`ttl\`: TTL (Time To Live)。数値で指定してください。不明な場合は \`null\` を設定してください。
    * \`priority\`: 優先度 (MXレコードやSRVレコードなど)。該当しない、または不明な場合は \`null\` を設定してください。
2.  **出力形式:** 抽出した情報は、JSON配列形式のコードブロックとして出力してください。
3.  **注意点:**
    * レスポンスには、JSON配列のコードブロックのみを含めてください。説明文、前置き、後書きは一切不要です。
    * 画像から読み取れない、または存在しないフィールドの値は \`null\` としてください。
    * レコードが1つも見つからなかった場合は、空の配列 \`[]\` を返してください。

# 出力フォーマットの例
\`\`\`json
[
  { "type": "A", "hostname": "@", "value": "192.0.2.1", "ttl": 3600, "priority": null },
  { "type": "CNAME", "hostname": "www", "value": "example.com.", "ttl": 3600, "priority": null },
  { "type": "MX", "hostname": "@", "value": "mail.example.com.", "ttl": 14400, "priority": 10 }
]
\`\`\`
`;
}

/**
 * テキスト解析用のプロンプトを生成します。
 * @return {string} プロンプトテキスト。
 */
function getPromptForText() {
    return `
あなたはDNSの専門家です。提供されたテキスト（BINDゾーンファイル、DNSレコードのリスト、非構造化テキストなど）を解析し、有効なすべてのDNSリソースレコード（RR）を抽出してください。

# 指示
1.  **抽出フィールド:** 各レコードについて、以下のフィールドを特定してください。
    * \`type\`: レコードのタイプ (例: A, CNAME, MX, TXT, NS, SOA)。
    * \`hostname\`: ホスト名。\`@\` やFQDNも適切に扱ってください。
    * \`value\`: レコードの値。SOAレコードの場合、すべてのパラメータを一つの文字列にまとめてください。
    * \`ttl\`: TTL。存在しない場合は \`null\` にしてください。
    * \`priority\`: MXやSRVレコードの優先度。該当しない場合は \`null\` にしてください。
2.  **出力形式:** JSON配列形式のコードブロックとして出力してください。
3.  **ルール:**
    * レスポンスにはJSON配列のコードブロックのみを含めてください。説明文は不要です。
    * \`;\`で始まるコメント行は無視してください。
    * レコードが見つからない場合は空の配列 \`[]\` を返してください。

# 出力フォーマットの例
\`\`\`json
[
  {
    "type": "SOA",
    "hostname": "@",
    "value": "ns1.example.com. admin.example.com. 2023010101 7200 3600 1209600 86400",
    "ttl": 86400,
    "priority": null
  },
  {
    "type": "A",
    "hostname": "www",
    "value": "192.0.2.1",
    "ttl": 3600,
    "priority": null
  }
]
\`\`\`
`;
}

/**
 * Gemini APIにアップロードされたファイルを削除します。
 * @param {string} fileName 削除するファイルのGemini名 (例: "files/abc-123")。
 */
function deleteGeminiFile(fileName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`;
  const options = { method: 'DELETE', muteHttpExceptions: true };
  UrlFetchApp.fetch(url, options);
}

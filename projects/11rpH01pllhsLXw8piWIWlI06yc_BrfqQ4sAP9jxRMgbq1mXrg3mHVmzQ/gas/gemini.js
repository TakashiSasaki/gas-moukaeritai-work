/**
 * @OnlyCurrentDoc
 *
 * スクリプトプロパティからAPIキーを取得します。
 */
const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
const API_ENDPOINT_FLASH_LITE = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`;
const CACHE_EXPIRATION_SECONDS = 21600; // 6時間

/**
 * テキストのハッシュ値を計算してキャッシュキーの一部として使用します。
 * @param {string} text ハッシュ値を計算するテキスト。
 * @return {string} 計算されたMD5ハッシュ値。
 */
function computeHash_(text) {
  if (!text) return 'empty';
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, text, Utilities.Charset.UTF_8);
  return digest.map(byte => {
    const hex = (byte & 0xFF).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}


/**
 * 画像のBase64データを受け取り、Gemini APIを使用して短いタイトル風のキャプションを生成します。
 *
 * @param {string} base64ImageData 画像のBase64エンコードされたデータ。
 * @param {string} mimeType 画像のMIMEタイプ。
 * @param {boolean} useCache キャッシュを利用する場合はtrue、常にAPIを呼び出す場合はfalse。
 * @return {string} 生成されたキャプション、またはエラーメッセージ。
 */
function generateCaptionForImage(base64ImageData, mimeType, useCache = false) { // useCache 引数を追加
  if (!API_KEY) {
    console.error("[GAS generateCaptionForImage] APIキーが設定されていません。");
    return "エラー: APIキーが設定されていません。";
  }
  if (!base64ImageData || !mimeType) {
    console.error("[GAS generateCaptionForImage] 画像データまたはMIMEタイプが指定されていません。");
    return "エラー: 画像データまたはMIMEタイプが不足しています。";
  }

  const cache = CacheService.getScriptCache();
  const imageHash = computeHash_(base64ImageData.substring(0,1000)); 
  const cacheKey = `caption_${mimeType}_${imageHash}`;
  
  if (useCache) {
    const cachedCaption = cache.get(cacheKey);
    if (cachedCaption) {
      console.log("[GAS generateCaptionForImage] キャッシュからキャプションを返します:", cacheKey);
      return cachedCaption;
    }
  }

  const generationConfig = {
    temperature: 0.7, 
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 100, 
    responseMimeType: 'text/plain',
  };

  const requestPayload = {
    generationConfig,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'この画像に30文字以内で簡潔なタイトルを付けてください。' 
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64ImageData
            }
          }
        ],
      },
    ],
  };

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(requestPayload),
    muteHttpExceptions: true 
  };

  try {
    const response = UrlFetchApp.fetch(API_ENDPOINT_FLASH_LITE, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode === 200) {
      const jsonResponse = JSON.parse(responseBody);
      if (jsonResponse.candidates && jsonResponse.candidates.length > 0 &&
          jsonResponse.candidates[0].content && jsonResponse.candidates[0].content.parts &&
          jsonResponse.candidates[0].content.parts.length > 0 && jsonResponse.candidates[0].content.parts[0].text) {
        const caption = jsonResponse.candidates[0].content.parts[0].text.trim();
        cache.put(cacheKey, caption, CACHE_EXPIRATION_SECONDS); 
        console.log("[GAS generateCaptionForImage] キャプションを生成しキャッシュに保存しました:", cacheKey);
        return caption;
      } else {
        console.error("[GAS generateCaptionForImage] APIからのレスポンス形式が不正です:", responseBody);
        return "エラー: キャプションを取得できませんでした（レスポンス形式異常）。";
      }
    } else {
      console.error(`[GAS generateCaptionForImage] APIリクエストエラー (${responseCode}): ${responseBody}`);
      return `エラー: キャプション生成に失敗しました (コード: ${responseCode})。`;
    }
  } catch (error) {
    console.error("[GAS generateCaptionForImage] キャプション生成中に予期せぬエラー:", error.toString(), error.stack);
    return `エラー: 予期せぬエラーが発生しました - ${error.message}`;
  }
}


/**
 * マークダウンテキストを受け取り、Gemini APIを使用して短いパネルタイトルを生成します。
 *
 * @param {string} markdownText タイトル生成の元となるマークダウンテキスト。
 * @param {boolean} useCache キャッシュを利用する場合はtrue、常にAPIを呼び出す場合はfalse。
 * @return {string} 生成されたタイトル、またはエラーメッセージ。
 */
function generateTitleFromMarkdown(markdownText, useCache = false) { // useCache 引数を追加
  if (!API_KEY) {
    console.error("[GAS generateTitleFromMarkdown] APIキーが設定されていません。");
    return "エラー: APIキーが設定されていません。";
  }
  if (!markdownText || markdownText.trim() === "") {
    console.error("[GAS generateTitleFromMarkdown] マークダウンテキストが空です。");
    return "エラー: マークダウンテキストが空です。";
  }

  const cache = CacheService.getScriptCache();
  const markdownHash = computeHash_(markdownText);
  const cacheKey = `panelTitle_${markdownHash}`;

  if (useCache) {
    const cachedTitle = cache.get(cacheKey);
    if (cachedTitle) {
      console.log("[GAS generateTitleFromMarkdown] キャッシュからパネルタイトルを返します:", cacheKey);
      return cachedTitle;
    }
  }

  const MAX_MARKDOWN_LENGTH = 1000;
  let processedMarkdown = markdownText;
  if (markdownText.length > MAX_MARKDOWN_LENGTH) {
    processedMarkdown = markdownText.substring(0, MAX_MARKDOWN_LENGTH) + "... (以下略)";
  }

  const generationConfig = {
    temperature: 0.6, 
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 50, 
    responseMimeType: 'text/plain',
  };

  const requestPayload = {
    generationConfig,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `以下のマークダウン内容から、20文字以内で最も適切なタイトルを生成してください。\n\nマークダウン内容:\n${processedMarkdown}`
          }
        ],
      },
    ],
  };

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(requestPayload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(API_ENDPOINT_FLASH_LITE, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode === 200) {
      const jsonResponse = JSON.parse(responseBody);
      if (jsonResponse.candidates && jsonResponse.candidates.length > 0 &&
          jsonResponse.candidates[0].content && jsonResponse.candidates[0].content.parts &&
          jsonResponse.candidates[0].content.parts.length > 0 && jsonResponse.candidates[0].content.parts[0].text) {
        let title = jsonResponse.candidates[0].content.parts[0].text.trim();
        title = title.replace(/^「|」$/g, '').replace(/^『|』$/g, '').replace(/^【|】$/g, '').replace(/^タイトル：/i, '').trim();
        cache.put(cacheKey, title, CACHE_EXPIRATION_SECONDS); 
        console.log("[GAS generateTitleFromMarkdown] パネルタイトルを生成しキャッシュに保存しました:", cacheKey);
        return title;
      } else {
        console.error("[GAS generateTitleFromMarkdown] APIからのレスポンス形式が不正です:", responseBody);
        return "エラー: タイトルを取得できませんでした（レスポンス形式異常）。";
      }
    } else {
      console.error(`[GAS generateTitleFromMarkdown] APIリクエストエラー (${responseCode}): ${responseBody}`);
      return `エラー: タイトル生成に失敗しました (コード: ${responseCode})。`;
    }
  } catch (error) {
    console.error("[GAS generateTitleFromMarkdown] タイトル生成中に予期せぬエラー:", error.toString(), error.stack);
    return `エラー: 予期せぬエラーが発生しました - ${error.message}`;
  }
}

/**
 * 複数のパネルのデータ（タイトルとマークダウン）を受け取り、
 * それらを総合してドキュメント全体のタイトルを生成します。
 *
 * @param {Array<Object>} panelsData 各パネルのデータを含む配列。各オブジェクトは { title: string, markdown: string } を持つ。
 * @param {boolean} useCache キャッシュを利用する場合はtrue、常にAPIを呼び出す場合はfalse。
 * @return {string} 生成されたドキュメントタイトル、またはエラーメッセージ。
 */
function generateDocumentTitleFromPanels(panelsData, useCache = false) { // useCache 引数を追加
  if (!API_KEY) {
    console.error("[GAS generateDocumentTitleFromPanels] APIキーが設定されていません。");
    return "エラー: APIキーが設定されていません。";
  }
  if (!panelsData || !Array.isArray(panelsData) || panelsData.length === 0) {
    console.error("[GAS generateDocumentTitleFromPanels] パネルデータが空または無効です。");
    return "エラー: タイトル生成のためのコンテンツがありません。";
  }

  let combinedContent = "";
  panelsData.forEach((panel, index) => {
    if (panel.title && panel.title.trim() !== "") {
      combinedContent += `パネル ${index + 1} タイトル: ${panel.title.trim()}\n`;
    }
    if (panel.markdown && panel.markdown.trim() !== "") {
      combinedContent += `パネル ${index + 1} 内容:\n${panel.markdown.trim()}\n\n`;
    }
  });

  if (combinedContent.trim() === "") {
    console.error("[GAS generateDocumentTitleFromPanels] 結合されたコンテンツが空です。");
    return "エラー: タイトル生成のための有効なコンテンツがありません。";
  }
  
  const cache = CacheService.getScriptCache();
  const contentHash = computeHash_(combinedContent);
  const cacheKey = `docTitle_${contentHash}`;

  if (useCache) {
    const cachedTitle = cache.get(cacheKey);
    if (cachedTitle) {
      console.log("[GAS generateDocumentTitleFromPanels] キャッシュからドキュメントタイトルを返します:", cacheKey);
      return cachedTitle;
    }
  }

  const MAX_COMBINED_LENGTH = 2000; 
  if (combinedContent.length > MAX_COMBINED_LENGTH) {
    combinedContent = combinedContent.substring(0, MAX_COMBINED_LENGTH) + "... (一部抜粋)";
  }

  const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 80, 
    responseMimeType: 'text/plain',
  };

  const requestPayload = {
    generationConfig,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `以下の複数のパネルの内容を総合的に表す、最も簡潔で魅力的なドキュメント全体のタイトルを1つだけ、タイトル文字列のみで提案してください。\n\n${combinedContent}`
          }
        ],
      },
    ],
  };

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(requestPayload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(API_ENDPOINT_FLASH_LITE, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode === 200) {
      const jsonResponse = JSON.parse(responseBody);
      if (jsonResponse.candidates && jsonResponse.candidates.length > 0 &&
          jsonResponse.candidates[0].content && jsonResponse.candidates[0].content.parts &&
          jsonResponse.candidates[0].content.parts.length > 0 && jsonResponse.candidates[0].content.parts[0].text) {
        let title = jsonResponse.candidates[0].content.parts[0].text.trim();
        title = title.split('\n')[0].trim(); 
        title = title.replace(/^「|」$/g, '').replace(/^『|』$/g, '').replace(/^【|】$/g, '').replace(/^タイトル：/i, '').replace(/^\*+\s*/, '').trim();
        cache.put(cacheKey, title, CACHE_EXPIRATION_SECONDS); 
        console.log("[GAS generateDocumentTitleFromPanels] ドキュメントタイトルを生成しキャッシュに保存しました:", cacheKey);
        return title;
      } else {
        console.error("[GAS generateDocumentTitleFromPanels] APIからのレスポンス形式が不正です:", responseBody);
        return "エラー: ドキュメントタイトルを取得できませんでした（レスポンス形式異常）。";
      }
    } else {
      console.error(`[GAS generateDocumentTitleFromPanels] APIリクエストエラー (${responseCode}): ${responseBody}`);
      return `エラー: ドキュメントタイトル生成に失敗しました (コード: ${responseCode})。`;
    }
  } catch (error) {
    console.error("[GAS generateDocumentTitleFromPanels] ドキュメントタイトル生成中に予期せぬエラー:", error.toString(), error.stack);
    return `エラー: 予期せぬエラーが発生しました - ${error.message}`;
  }
}


/**
 * テスト用の関数です。
 */
function testFunctions() {
  Logger.log("--- testGenerateCaption 開始 (useCache: false) ---");
  const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const dummyMimeType = "image/png";
  let caption = generateCaptionForImage(dummyBase64, dummyMimeType, false); // キャッシュを使わない
  Logger.log(`テストキャプション (API): ${caption}`);
  
  Logger.log("--- testGenerateCaption 開始 (useCache: true) ---");
  caption = generateCaptionForImage(dummyBase64, dummyMimeType, true); // キャッシュを使う
  Logger.log(`テストキャプション (Cache): ${caption}`);
  Logger.log("--- testGenerateCaption 終了 ---");


  Logger.log("--- testGenerateTitleFromMarkdown 開始 (useCache: false) ---");
  const sampleMarkdown = "# これはテストです\n\nこれはテスト用のマークダウンコンテンツです。\n\n- リスト1\n- リスト2";
  let panelTitle = generateTitleFromMarkdown(sampleMarkdown, false); // キャッシュを使わない
  Logger.log(`テストパネルタイトル (API): ${panelTitle}`);

  Logger.log("--- testGenerateTitleFromMarkdown 開始 (useCache: true) ---");
  panelTitle = generateTitleFromMarkdown(sampleMarkdown, true); // キャッシュを使う
  Logger.log(`テストパネルタイトル (Cache): ${panelTitle}`);
  Logger.log("--- testGenerateTitleFromMarkdown 終了 ---");


  Logger.log("--- testGenerateDocumentTitleFromPanels 開始 (useCache: false) ---");
  const samplePanelsData = [
    { title: "はじめに", markdown: "このドキュメントの目的について説明します。" },
    { title: "主な機能", markdown: "機能A、機能B、機能Cがあります。" },
    { title: "", markdown: "## 詳細\n\nさらに詳しい情報を提供します。\n\n### サブセクション\n\nここにはサブセクションの内容が入ります。" }
  ];
  let documentTitle = generateDocumentTitleFromPanels(samplePanelsData, false); // キャッシュを使わない
  Logger.log(`テストドキュメントタイトル (API): ${documentTitle}`);

  Logger.log("--- testGenerateDocumentTitleFromPanels 開始 (useCache: true) ---");
  documentTitle = generateDocumentTitleFromPanels(samplePanelsData, true); // キャッシュを使う
  Logger.log(`テストドキュメントタイトル (Cache): ${documentTitle}`);
  Logger.log("--- testGenerateDocumentTitleFromPanels 終了 ---");
}


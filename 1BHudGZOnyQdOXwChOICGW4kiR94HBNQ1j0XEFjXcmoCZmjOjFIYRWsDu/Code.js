/**
 * 設定: スクリプトプロパティから認証情報を取得
 * (CLIENT_ID, CLIENT_SECRET を設定済みであること)
 */
function getBloggerService() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const clientId = scriptProperties.getProperty('CLIENT_ID');
  const clientSecret = scriptProperties.getProperty('CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('スクリプトプロパティに CLIENT_ID または CLIENT_SECRET が設定されていません。');
  }

  return OAuth2.createService('Blogger')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setClientId(clientId)
    .setClientSecret(clientSecret)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    // 権限スコープ
    .setScope('https://www.googleapis.com/auth/blogger https://www.googleapis.com/auth/documents.readonly')
    .setParam('access_type', 'offline')
    .setParam('approval_prompt', 'force');
}

/**
 * ウェブアプリのエントリーポイント
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Docs to Blogger Publisher')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 認証後のコールバック
 */
function authCallback(request) {
  const service = getBloggerService();
  const authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('認証に成功しました！このタブを閉じて、元の画面で再試行してください。');
  } else {
    return HtmlService.createHtmlOutput('認証に失敗しました。');
  }
}

/**
 * ブログ一覧を取得
 */
function getBlogList() {
  const service = getBloggerService();
  
  if (!service.hasAccess()) {
    return {
      authRequired: true,
      authUrl: service.getAuthorizationUrl()
    };
  }

  const url = 'https://www.googleapis.com/blogger/v3/users/self/blogs';
  const response = UrlFetchApp.fetch(url, {
    headers: { 'Authorization': 'Bearer ' + service.getAccessToken() },
    muteHttpExceptions: true
  });
  
  const json = JSON.parse(response.getContentText());
  if (response.getResponseCode() !== 200) {
    throw new Error(json.error ? json.error.message : 'API Error: ' + response.getContentText());
  }

  return {
    authRequired: false,
    blogs: (json.items || []).map(b => ({ id: b.id, name: b.name, url: b.url }))
  };
}

/**
 * ドキュメント処理と投稿 (タブ対応版)
 */
function processDocument(docUrlOrId, blogId) {
  const service = getBloggerService();
  if (!service.hasAccess()) {
     return { success: false, message: '認証期限切れです。画面をリロードして再認証してください。' };
  }

  try {
    const docId = extractDocId(docUrlOrId);
    if (!docId) throw new Error("有効なGoogleドキュメントIDまたはURLではありません。");

    // ドキュメント取得
    const doc = DocumentApp.openById(docId);
    const title = doc.getName();
    
    // HTML変換 (ここでタブ対応ロジックを呼び出し)
    const content = convertDocToHtml(doc);

    // Bloggerへ投稿
    const url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts`;
    const payload = {
      "kind": "blogger#post",
      "blog": { "id": blogId },
      "title": title,
      "content": content,
      "labels": ["GAS自動投稿"]
    };

    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + service.getAccessToken() },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const json = JSON.parse(response.getContentText());
    if (response.getResponseCode() !== 200) {
      throw new Error(`Blogger API Error: ${json.error.message}`);
    }

    // 成功時にブログIDを保存
    PropertiesService.getUserProperties().setProperty('PREFERRED_BLOG_ID', blogId);

    return { success: true, url: json.url, title: json.title };

  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// --- ヘルパー関数 ---

function extractDocId(url) {
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

/**
 * ドキュメント全体をHTMLに変換する (Tabs対応)
 */
function convertDocToHtml(doc) {
  let html = "";
  let processed = false;

  // Tabs機能がサポートされているかチェック (getTabsメソッドの存在確認)
  if (typeof doc.getTabs === 'function') {
    const tabs = doc.getTabs();
    
    if (tabs.length > 0) {
      processed = true;
      // すべてのタブをループ処理
      tabs.forEach((tab, index) => {
        // Tab内のDocumentTabオブジェクトを取得
        const tabDoc = tab.asDocumentTab(); 
        const body = tabDoc.getBody();
        
        // タブの内容を変換して結合
        // 必要であればここにタブ名の見出しを追加できます: html += `<h2>${tab.getTitle()}</h2>`;
        html += processBody(body);

        // 最後のタブ以外には、区切り線を入れる
        if (index < tabs.length - 1) {
          html += '<hr style="margin: 30px 0; border: 0; border-top: 1px dashed #ccc;">';
        }
      });
    }
  }

  // タブ機能がない、またはタブが取得できなかった場合は従来通りルートのBodyを処理
  if (!processed) {
    html = processBody(doc.getBody());
  }

  // 元ドキュメントへのリンク
  html += `<hr><p><small>Original: <a href="${doc.getUrl()}" target="_blank">${doc.getName()}</a></small></p>`;
  
  return html;
}

/**
 * Bodyオブジェクト（本文）をHTML文字列に変換する共通関数
 */
function processBody(body) {
  const paragraphs = body.getParagraphs();
  let htmlChunk = "";
  
  paragraphs.forEach(p => {
    const text = p.getText();
    // 空行はスキップ（必要に応じて <br> にしても良い）
    if (!text.trim()) return;

    const type = p.getHeading();
    switch (type) {
      case DocumentApp.ParagraphHeading.HEADING1: 
        htmlChunk += `<h2>${text}</h2>`; 
        break;
      case DocumentApp.ParagraphHeading.HEADING2: 
        htmlChunk += `<h3>${text}</h3>`; 
        break;
      case DocumentApp.ParagraphHeading.HEADING3: 
        htmlChunk += `<h4>${text}</h4>`; 
        break;
      case DocumentApp.ParagraphHeading.HEADING4: 
        htmlChunk += `<h5>${text}</h5>`; 
        break;
      default: 
        // 改行コードを <br> に置換
        htmlChunk += `<p>${text.replace(/\n/g, '<br>')}</p>`; 
        break;
    }
  });
  
  return htmlChunk;
}

function getPreferredBlogId() {
  return PropertiesService.getUserProperties().getProperty('PREFERRED_BLOG_ID');
}
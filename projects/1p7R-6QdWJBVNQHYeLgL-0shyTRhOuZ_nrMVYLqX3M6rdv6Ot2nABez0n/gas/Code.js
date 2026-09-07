// スクリプトプロパティからコンシューマーキーを取得
const scriptProperties = PropertiesService.getScriptProperties();
const CONSUMER_KEY = scriptProperties.getProperty('CONSUMER_KEY');

/**
 * ウェブアプリケーションのエントリポイント
 * @param {Object} e HTTPリクエストのイベントオブジェクト
 * @returns {HtmlOutput} ユーザーに表示するHTMLコンテンツ
 */
function doGet(e) {
  // ユーザープロパティからACCESS_TOKENを取得
  const userProperties = PropertiesService.getUserProperties();
  const accessToken = userProperties.getProperty('ACCESS_TOKEN');

  // ACCESS_TOKENが存在しない場合、Pocketの認証フローを開始
  if (!accessToken) {
    const authorizationUrl = generateAuthorizationUrl();
    const html = HtmlService.createHtmlOutput(`<a href="${authorizationUrl}" target="_blank">Click here to authorize Pocket</a>`);
    return html;
  } else {
    // ACCESS_TOKENが存在する場合、index.htmlを表示
    // index.htmlをテンプレートとして読み込む
    return HtmlService.createTemplateFromFile('index').evaluate()
      .setTitle('Pocket Bookmarks')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Pocketの認証URLを生成する関数
 * @returns {string} 生成された認証URL
 */
function generateAuthorizationUrl() {
  // リクエストトークンを取得
  const requestToken = getRequestToken();

  // コールバックURLの生成
  const redirectUri = getCallbackURL('authCallback', { requestToken });

  // 認証URLの組み立て
  const authorizationUrl = `https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=${redirectUri}`;

  return authorizationUrl;
}

/**
 * コールバックURLを生成する関数
 * @param {string} callbackFunction 実行するコールバック関数名
 * @param {Object} params コールバックに渡すパラメータ
 * @returns {string} 生成されたコールバックURL
 */
function getCallbackURL(callbackFunction, params) {
  var url = ScriptApp.getService().getUrl();      // Ends in /exec (for a web app)
  url = url.slice(0, -4) + 'usercallback?state='; // Change /exec to /usercallback
  var stateToken = ScriptApp.newStateToken()
    .withMethod(callbackFunction)
    .withTimeout(120);

  // パラメータをStateTokenに追加
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      stateToken = stateToken.withArgument(key, params[key]);
    }
  }

  var token = stateToken.createToken();
  return url + token;
}

/**
 * コールバックを処理する関数
 * @param {Object} e コールバック時のリクエストデータ
 * @returns {HtmlOutput}
 */
function authCallback(e) {
  const requestToken = e.parameter.requestToken;
  if (!requestToken) {
    return HtmlService.createHtmlOutput('Error: Missing request token.');
  }

  // リクエストトークンをアクセストークンに変換
  const accessToken = getAccessToken(requestToken);
  Logger.log('Access Token: ' + accessToken);

  // アクセストークンをユーザープロパティに保存
  PropertiesService.getUserProperties().setProperty("ACCESS_TOKEN", accessToken);

  // アクセストークンを使用してindex.htmlを表示
  return HtmlService.createHtmlOutputFromFile('index');
}

/**
 * リクエストトークンを取得する関数
 * @returns {string} 取得したリクエストトークン
 */
function getRequestToken() {
  const url = 'https://getpocket.com/v3/oauth/request';
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Accept': 'application/x-www-form-urlencoded',
  };
  const payload = {
    consumer_key: CONSUMER_KEY,
    redirect_uri: getRedirectUri(),
  };

  const options = {
    method: 'post',
    headers: headers,
    payload: Object.keys(payload).map(key => `${key}=${encodeURIComponent(payload[key])}`).join('&'),
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseText = response.getContentText();

  // デバッグ: レスポンスの内容をログに表示
  Logger.log('Response Text: ' + responseText);

  // レスポンスを解析し、リクエストトークンを取得
  const data = parseFormUrlEncoded(responseText);

  if (!data.code) {
    throw new Error(`Failed to obtain request token: ${responseText}`);
  }

  Logger.log('Request Token: ' + data.code);
  return data.code; // リクエストトークンを返す
}

/**
 * x-www-form-urlencoded形式のレスポンスを解析する関数
 * @param {string} text URLエンコードされた文字列
 * @returns {Object} パースしたオブジェクト
 */
function parseFormUrlEncoded(text) {
  const pairs = text.split('&');
  const result = {};
  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    result[key] = decodeURIComponent(value);
  });
  return result;
}

/**
 * コールバック用のリダイレクトURIを取得する関数
 * @returns {string} リダイレクトURI
 */
function getRedirectUri() {
  // ScriptAppサービスを使ってデプロイ先のURLを自動取得し、/execを/usercallbackに変更
  return ScriptApp.getService().getUrl().replace('/exec', '/usercallback');
}

/**
 * リクエストトークンをアクセストークンに変換する関数
 * @param {string} requestToken リクエストトークン
 * @returns {string} 取得したアクセストークン
 */
function getAccessToken(requestToken) {
  const url = 'https://getpocket.com/v3/oauth/authorize';
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Accept': 'application/x-www-form-urlencoded',
  };
  const payload = {
    consumer_key: CONSUMER_KEY,
    code: requestToken,
  };

  const options = {
    method: 'post',
    headers: headers,
    payload: Object.keys(payload).map(key => `${key}=${encodeURIComponent(payload[key])}`).join('&'),
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseText = response.getContentText();

  // デバッグ: レスポンスの内容をログに表示
  Logger.log('Response Text: ' + responseText);

  const data = parseFormUrlEncoded(responseText);

  if (!data.access_token) {
    throw new Error(`Failed to convert request token to access token: ${responseText}`);
  }

  return data.access_token; // アクセストークンを返す
}

// File: Authorization.gs

// OAuth1ライブラリを使用してOAuthサービスを設定
function getOAuth1Service() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const API_KEY = scriptProperties.getProperty('API_KEY');
  const API_KEY_SECRET = scriptProperties.getProperty('API_KEY_SECRET');

  if (!API_KEY || !API_KEY_SECRET) {
    throw new Error('API_KEY or API_KEY_SECRET is not set in Script Properties.');
  }

  const lock = LockService.getUserLock();
  if (!lock.tryLock(10000)) {
    throw new Error('Could not acquire lock.');
  }

  // OAuth1サービスの設定
  const service = OAuth1.createService('twitter')
    .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
    .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
    .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
    .setConsumerKey(API_KEY)
    .setConsumerSecret(API_KEY_SECRET)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())

  lock.releaseLock();

  return service;
}

// OAuth 1.0a認証シーケンスを開始するための関数
function startAuthorization() {
  const service = getOAuth1Service();
  if (!service.hasAccess()) {
    const authorizationUrl = service.authorize();
    Logger.log('Authorization URL: ' + authorizationUrl); // 認可URLのログ
    return authorizationUrl;  // このURLをウェブUIで表示
  } else {
    return 'Already authorized.';
  }
}


// 認可URLを取得する関数（OAuth 1.0a用）
function getAuthorizationUrl() {
  const service = getOAuth1Service();
  
  // サービスがまだアクセスを持っていない場合は認可URLを生成する
  if (!service.hasAccess()) {
    const authorizationUrl = service.authorize(); // 認可URLを取得
    Logger.log('Authorization URL: ' + authorizationUrl); // ログ出力
    return authorizationUrl;  // 認可URLを返す
  } else {
    return 'Already authorized.';  // 既に認証されている場合のメッセージ
  }
}



// リダイレクトURLを取得する関数
function getRedirectUrl() {
  const service = getOAuthService();
  return service.getRedirectUri(); // リダイレクトURIを取得
}

// ユーザーのトークンを取得
// function getTokens() {
//   const service = getOAuth1Service();
  
//   // OAuth1ライブラリから直接トークンを取得
//   const accessToken = service.getAccessToken(); 
//   const refreshToken = service.getRefreshToken(); // 通常、OAuth1.0aにはリフレッシュトークンはありません

//   Logger.log('Access Token: ' + accessToken);
//   Logger.log('Refresh Token: ' + refreshToken);

//   return { 
//     accessToken: accessToken || 'Not available', 
//     refreshToken: refreshToken || 'Not available' // リフレッシュトークンがない場合も考慮
//   };
// }

// OAuth1.0a認証のコールバック処理
function authCallback(request) {
  const service = getOAuth1Service();
  
  try {
    const isAuthorized = service.handleCallback(request);
    if (isAuthorized) {
      Logger.log('Authorization successful.');
      return HtmlService.createHtmlOutput('<script>window.opener.location.reload();window.close();</script>'); // 元のUIに戻る
    } else {
      Logger.log('Authorization denied.');
      return HtmlService.createHtmlOutput('<script>window.opener.location.reload();window.close();</script>'); // 失敗しても戻る
    }
  } catch (error) {
    Logger.log('Error handling callback: ' + error.message);
    Logger.log('Request parameters: ' + JSON.stringify(request.parameters));
    return HtmlService.createHtmlOutput('<script>window.opener.location.reload();window.close();</script>'); // エラーでもUIに戻る
  }
}

// OAuth1のステート情報を取得
function getOAuthState() {
  const service = getOAuth1Service();

  // 認証状態をチェック
  const isAuthorized = service.hasAccess();
  
  Logger.log('Authorization state checked: ' + (isAuthorized ? 'Authorized' : 'Not authorized'));
  
  return isAuthorized ? 'Authorized' : 'Not authorized';
}

// コールバックURLを取得する関数
function getCallbackUrl() {
  const service = getOAuth1Service();

  // コールバックURLを取得して返す
  const callbackUrl = service.getRedirectUri();
  Logger.log('Callback URL: ' + callbackUrl);
  return callbackUrl;
}

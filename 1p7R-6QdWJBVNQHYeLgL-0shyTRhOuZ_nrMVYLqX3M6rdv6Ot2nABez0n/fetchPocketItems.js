//filename: fetchPocketItems.gs

/**
 * Pocketからアイテムを取得する関数
 * @param {Object} options 取得するアイテムに適用するオプションパラメータ
 * @returns {Array} 取得したアイテムのリスト
 */
function fetchPocketItems(options = {}) {
  // ユーザープロパティからACCESS_TOKENを取得
  const userProperties = PropertiesService.getUserProperties();
  const accessToken = userProperties.getProperty('ACCESS_TOKEN');

  if (!accessToken) {
    throw new Error('Access token is missing.');
  }

  // Pocket APIリクエストのURLとヘッダーの設定
  const url = 'https://getpocket.com/v3/get';
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'X-Accept': 'application/json',
  };

  // デフォルトパラメータの設定
  const defaultOptions = {
    consumer_key: CONSUMER_KEY,
    access_token: accessToken,
    count: 10, // デフォルトで10件取得
    detailType: 'complete', // 完全な情報を取得
  };

  // ユーザーからのオプションをマージ
  const payload = Object.assign(defaultOptions, options);

  // APIリクエストのオプション設定
  const requestOptions = {
    method: 'post',
    headers: headers,
    payload: JSON.stringify(payload),
  };

  try {
    const response = UrlFetchApp.fetch(url, requestOptions);
    const responseText = response.getContentText();

    // レスポンスをユーザープロパティにキャッシュ
    userProperties.setProperty('POCKET_RAW_RESPONSE', responseText);

    // レスポンスをJSONとして解析し、アイテムを抽出
    const data = JSON.parse(responseText);
    const items = Object.values(data.list);
    return items;
  } catch (error) {
    Logger.log('Error fetching items: ' + error.message);
    throw new Error('Failed to fetch Pocket items.');
  }
}

/**
 * 生のレスポンスデータを取得する関数
 * @returns {string} キャッシュされたJSONレスポンス
 */
function getRawResponse() {
  const userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty('POCKET_RAW_RESPONSE');
}

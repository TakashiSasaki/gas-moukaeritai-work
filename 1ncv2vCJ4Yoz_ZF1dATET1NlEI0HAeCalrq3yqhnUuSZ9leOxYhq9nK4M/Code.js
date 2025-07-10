/**
 * @fileoverview
 * PubCacheライブラリと連携し、DNSレコードの保存と取得を管理するサーバーサイド関数。
 */

/**
 * [Web App用] 指定されたキーと値のペアをPubCacheライブラリを使用して保存します。
 * @param {string} key 保存するキー。PubCacheの仕様（43文字以上）を満たす必要があります。
 * @param {string} value 保存する値（JSON文字列など）。
 * @return {string} 成功メッセージ。
 */
function saveDataToCache(key, value) {
  try {
    // PubCacheライブラリがキーの検証と有効期限の設定を内部で行う
    PubCache.put(key, value);

    Logger.log(`[PubCache] Saved data with key: ${key}`);
    return `Successfully saved data to cache.`;
  } catch (e) {
    Logger.log(`[PubCache ERROR] ${e.stack}`);
    throw new Error(`Server-side cache error: ${e.message}`);
  }
}

/**
 * [Web App用] PubCacheライブラリを使用して指定されたキーのAPIエンドポイントURLを取得します。
 * @param {string} key URLを取得するためのキー。
 * @return {string|null} エンドポイントURL。キーが無効な場合はnull。
 */
function getEndpointUrl(key) {
    // PubCache.getEndpointはキーの有効性をチェックし、無効ならnullを返す
    return PubCache.getEndpoint(key);
}

/**
 * [Web App用] 指定されたエンドポイントURLからコンテンツを取得します。
 * リダイレクトを追跡し、最終的なコンテンツを返します。
 * @param {string} url 取得するURL。
 * @return {string} 取得したコンテンツのテキスト。
 */
function fetchFromEndpoint(url) {
  try {
    if (!url || !url.startsWith('http')) {
      throw new Error('Invalid URL provided.');
    }
    const options = {
      'method' : 'GET',
      'followRedirects' : true, // リダイレクトを追跡する
      'muteHttpExceptions': true
    };
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();

    if (responseCode === 200) {
      Logger.log(`[Fetch] Successfully fetched content from ${url}`);
      return response.getContentText();
    } else {
      throw new Error(`Failed to fetch from endpoint. Status code: ${responseCode}`);
    }
  } catch (e) {
    Logger.log(`[Fetch ERROR] ${e.stack}`);
    throw new Error(`Server-side fetch error: ${e.message}`);
  }
}

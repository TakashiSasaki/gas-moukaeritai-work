// --- 定数定義 ---
const MAX_EXPIRATION = 21600; // 6時間 (秒)
const MIN_KEY_LENGTH = 43;   // 32バイトデータのBase64urlエンコード後の最小長

// ===============================================================
// ライブラリとして公開する関数 (Public API)
// ===============================================================

/**
 * 指定されたキーに対応するAPIエンドポイントURLを返します。
 * @param {string} key URLに含めるキー。
 * @returns {string|null} 完全なエンドポイントURL。キーが無効な場合はnullを返します。
 */
function getEndpoint(key) {
  if (!_isValidKey(key)) {
    return null;
  }
  return "https://script.google.com/macros/s/AKfycbySWM-zP6L4yiypXCK4_o8IZHEeM02l1MGnzIrXB0utA3Q92_P89sp0z4E9uMH3RdvRUg/exec" + "?" + key;
  //return ScriptApp.getService().getUrl() + '?' + key;
}

/**
 * 指定されたキーに対応する値をキャッシュから取得します。
 * 値の取得に成功した場合、そのキーの有効期限は自動的にリセットされます。
 * @param {string} key 取得したいデータのキー。
 * @returns {string|null} キーに対応する値。見つからない場合はnullを返します。
 */
function get(key) {
  if (!_isValidKey(key)) {
    return null;
  }
  const cache = CacheService.getScriptCache();
  const value = cache.get(key);

  if (value !== null) {
    // 値の取得に成功した場合、有効期限をリセットするために再保存する
    cache.put(key, value, MAX_EXPIRATION);
  }
  return value;
}

/**
 * キーと値のペアをキャッシュに保存します。
 * @param {string} key 保存するデータのキー。
 * @param {string} value 保存するデータ。
 * @param {integer} expirationInSeconds (任意) 有効期限(秒)。1から21600まで。デフォルトは21600秒。
 */
function put(key, value, expirationInSeconds) {
  if (!_isValidKey(key) || typeof value !== 'string') {
    return;
  }
  const expiration = (expirationInSeconds > 0 && expirationInSeconds <= MAX_EXPIRATION)
    ? expirationInSeconds
    : MAX_EXPIRATION;

  const cache = CacheService.getScriptCache();
  cache.put(key, value, expiration);
}

/**
 * 複数のキーと値のペアをオブジェクト形式でキャッシュに保存します。
 * @param {Object} values 保存したいキーと値のペアを含むオブジェクト。例: {'key1': 'value1', 'key2': 'value2'}
 * @param {integer} expirationInSeconds (任意) 有効期限(秒)。デフォルトは21600秒。
 */
function putAll(values, expirationInSeconds) {
  if (typeof values !== 'object' || values === null) {
    return;
  }
  const validEntries = {};
  for (const key in values) {
    if (Object.prototype.hasOwnProperty.call(values, key) && _isValidKey(key)) {
      validEntries[key] = values[key];
    }
  }

  const expiration = (expirationInSeconds > 0 && expirationInSeconds <= MAX_EXPIRATION)
    ? expirationInSeconds
    : MAX_EXPIRATION;

  if (Object.keys(validEntries).length > 0) {
    const cache = CacheService.getScriptCache();
    cache.putAll(validEntries, expiration);
  }
}

/**
 * 指定されたキーの値をキャッシュから削除します。
 * @param {string} key 削除したいデータのキー。
 */
function remove(key) {
  if (!_isValidKey(key)) {
    return;
  }
  const cache = CacheService.getScriptCache();
  cache.remove(key);
}

/**
 * 指定されたキーのリストに一致するすべての値をキャッシュから削除します。
 * @param {string[]} keys 削除したいデータのキーを含む配列。
 */
function removeAll(keys) {
  if (!Array.isArray(keys)) {
    return;
  }
  const validKeys = keys.filter(_isValidKey);
  if (validKeys.length > 0) {
    const cache = CacheService.getScriptCache();
    cache.removeAll(validKeys);
  }
}

// ===============================================================
// ウェブアプリ用バックエンド関数
// ===============================================================

/**
 * WebアプリへのGETリクエストを処理するメイン関数。
 * @param {Object} e イベントオブジェクト。
 * @returns {HtmlOutput | TextOutput} モードに応じたアウトプット。
 */
function doGet(e) {
  const baseUrl = ScriptApp.getService().getUrl();

  if (e && e.parameter && typeof e.parameter.readme !== 'undefined') {
    const template = HtmlService.createTemplateFromFile('readme');
    template.baseUrl = baseUrl;
    return template.evaluate().setTitle('仕様書 - PubCache').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  }

  if (e && e.parameter && Object.keys(e.parameter).length > 0) {
    const key = Object.keys(e.parameter)[0];
    const value = get(key); // ライブラリ関数を呼び出す
    return ContentService.createTextOutput(value || '').setMimeType(ContentService.MimeType.TEXT);
  }

  const template = HtmlService.createTemplateFromFile('index');
  template.baseUrl = baseUrl;
  return template.evaluate().setTitle('PubCache').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/**
 * UIから呼び出されるデータ保存用関数。
 * @param {string} key 保存するデータのキー。
 * @param {string} value 保存するデータ。
 * @returns {string} 処理結果を示すメッセージ。
 */
function saveData(key, value) {
  if (!_isValidKey(key)) {
    return `エラー: キーは${MIN_KEY_LENGTH}文字以上のBase64/base64url文字列である必要があります。`;
  }
  try {
    put(key, value); // ライブラリ関数を呼び出す
    return '成功: 値をキャッシュに保存しました。';
  } catch (e) {
    return 'エラー: ' + e.message;
  }
}

/**
 * UIから呼び出されるデータ取得用関数。
 * @param {string} key 取得したいデータのキー。
 * @returns {string|null} キーに対応する値。
 */
function loadData(key) {
  return get(key); // ライブラリ関数を呼び出す
}

// ===============================================================
// 内部ヘルパー関数
// ===============================================================

/**
 * キーが要件を満たしているか検証する内部関数。
 * @param {string} key 検証するキー文字列。
 * @returns {boolean} 有効な場合はtrue、そうでない場合はfalse。
 * @private
 */
function _isValidKey(key) {
  if (typeof key !== 'string' || key.length < MIN_KEY_LENGTH) {
    return false;
  }
  // Base64url形式の文字種かチェック
  return /^[A-Za-z0-9\-_]+$/.test(key);
}

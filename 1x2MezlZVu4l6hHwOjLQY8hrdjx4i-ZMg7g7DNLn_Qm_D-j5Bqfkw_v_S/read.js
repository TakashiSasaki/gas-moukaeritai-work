/**
 * キーを指定して、ユーザーキャッシュまたはスプレッドシートから値を読み取ります。キャッシュに値が存在する場合は、その値を返します。存在しない場合は、スプレッドシートから値を検索し、見つかった値を返します。値が見つからない場合は、空文字列を返します。
 *
 * @param {string} [key="TESTKEY"] - ユーザーキャッシュまたはスプレッドシートから読み取るキー。デフォルトは "TESTKEY"。
 * @returns {string} キーに対応する値。値が見つからない場合は空文字列。
 * @throws {Error} ロックが取得できない場合にエラーをスローします。
 */
function read(key) {
  if (key === undefined) key = "TESTKEY";
  const cache = CacheService.getUserCache();
  let value = cache.get(key);

  if (value !== null) {
    cache.put(key, value, 21600);
    return value;
  }

  const lock = LockService.getUserLock();
  lock.waitLock(30000);  // 最大30秒待つ

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][0] === key) {
      value = data[i][1];
      break;
    }
  }

  lock.releaseLock();  // ロックを解除

  if (value === undefined) value = "";  // value が見つからなかった時には空文字列を返す

  return value;
}//read

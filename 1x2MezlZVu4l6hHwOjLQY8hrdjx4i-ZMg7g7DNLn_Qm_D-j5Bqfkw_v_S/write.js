/**
 * スプレッドシートとユーザーキャッシュにキーと値のペアを書き込みます。既にスプレッドシートに同じキーと値のペアが存在する場合は、そのペアをユーザーキャッシュに追加します。存在しない場合は、新しい行をスプレッドシートに追加し、そのペアをユーザーキャッシュにも追加します。
 *
 * @param {string} [key="TESTKEY"] - スプレッドシートとユーザーキャッシュに書き込むキー。デフォルトは "TESTKEY"。
 * @param {string} [value="TESTVALUE"] - スプレッドシートとユーザーキャッシュに書き込む値。デフォルトは "TESTVALUE"。
 * @throws {Error} ロックが取得できない場合にエラーをスローします。
 */
function write(key, value) {
  if (key === undefined) key = "TESTKEY";
  if (value === undefined) value = "TESTVALUE";
  // ユーザーレベルのロックを取得
  const lock = LockService.getUserLock();
  lock.waitLock(30000);  // 最大30秒待つ

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  // ss にすでに key, value 組に該当する行があるかしらべる
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][0] === key && data[i][1] === value) {
      // ユーザーキャッシュに key, value を保存
      const cache = CacheService.getUserCache();
      cache.put(key, value, 21600);

      lock.releaseLock();  // ロックを解除
      return;
    }
  }//for

  // 新しい行に追加
  sheet.appendRow([key, value]);

  // ユーザーキャッシュにも追加
  const cache = CacheService.getUserCache();
  cache.put(key, value, 21600);

  lock.releaseLock();  // ロックを解除
  return;
}//write

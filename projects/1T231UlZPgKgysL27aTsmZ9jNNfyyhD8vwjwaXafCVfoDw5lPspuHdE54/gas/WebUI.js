/**
 * Apps Script WebUI用サーバーサイドロジック
 * ユーザーインターフェースの表示と、Code.gsからのデプロイメントデータ取得を処理する。
 */

/**
 * ウェブアプリへのGETリクエストを処理し、UI (index.html) を表示する。
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('GAS デプロイメント・マネージャ')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

/**
 * Code.gsに定義された網羅的なデプロイメント情報取得関数を呼び出す。
 * 結果はJSONとしてクライアントに渡される。
 *
 * NOTE: getDeploymentStatusForAllScripts() は Code.gs に存在すると仮定する。
 * @returns {string} デプロイメントデータのJSON文字列
 */
function loadDeploymentData() {
  try {
    // Code.gsのメイン関数を呼び出し、結果を取得
    const results = getDeploymentStatusForAllScripts();
    
    // UI処理用に整形（特にエラーメッセージを統合）
    const formattedResults = results.map(item => {
      const isSuccess = item.status === 'SUCCESS';
      return {
        // ★修正箇所: Code.gsの戻り値のキー (id, title) に合わせる
        id: item.id,
        title: item.title,
        createdDate: item.createdDate, // Code.gsから渡される日時情報
        modifiedDate: item.modifiedDate, // Code.gsから渡される日時情報
        // ----------------------------------------------------
        status: isSuccess ? 'OK' : 'ERROR',
        message: isSuccess ? `${item.webApps.length} 件のウェブアプリを検出` : item.message,
        webApps: item.webApps
      };
    });
    
    return JSON.stringify(formattedResults);
    
  } catch (e) {
    // 重大なシステムエラーが発生した場合
    return JSON.stringify({ error: true, message: `サーバーサイド処理エラー: ${e.toString()}` });
  }
}

/**
 * クライアントサイドのJavaScriptから利用可能なログをクリアする (開発用)
 */
function clearCacheAndReload() {
  const CACHE_KEY_SCRIPTS = 'ALL_SCRIPT_IDS';
  
  try {
    // Drive IDリストのキャッシュをクリア
    CacheService.getUserCache().remove(CACHE_KEY_SCRIPTS);
    // デプロイメントキャッシュのクリアは、Script IDリストの取得後に実行されるため、ここでは不要。
    
    console.log("Drive IDキャッシュをクリアしました。");
    // キャッシュクリア後、データを再ロードしてクライアントに返す
    return loadDeploymentData(); 
  } catch (e) {
    return JSON.stringify({ error: true, message: `キャッシュクリアエラー: ${e.toString()}` });
  }
}
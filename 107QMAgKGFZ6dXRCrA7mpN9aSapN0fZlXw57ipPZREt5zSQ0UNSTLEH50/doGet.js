/**
 * Webアプリとしてアクセスされた際に実行される関数。
 * @param {Object} e - イベントオブジェクト
 * @return {HtmlOutput} 生成されたHTMLページ
 */
function doGet(e) {
  // セッションから、スクリプトを実行している有効なユーザーのメールアドレスを取得
  const userEmail = Session.getActiveUser().getEmail();
  
  // テンプレートを準備
  const html = HtmlService.createTemplateFromFile('index');

  // メールアドレスが取得できなかった場合
  if (!userEmail) {
    html.modelName = '認証エラー';
    html.androidId = 'ユーザーのメールアドレスを取得できませんでした。';
    html.packageList = [];
  } else {
    // 取得したメールアドレスを引数としてコア機能を呼び出す
    const result = getLatestPackageData(userEmail);
    
    // 取得結果に応じてテンプレートに渡すデータを設定
    html.modelName = result.modelName;
    html.androidId = result.androidId;
    html.packageList = result.packageList;
  }

  // 評価されたHTMLをWebページとして返す
  return html.evaluate()
             .setTitle('Android Package List Viewer')
             .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
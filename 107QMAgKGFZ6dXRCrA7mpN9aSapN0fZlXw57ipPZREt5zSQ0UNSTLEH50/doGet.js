/**
 * Webアプリとしてアクセスされた際に実行される関数。
 * @param {Object} e - イベントオブジェクト
 * @return {HtmlOutput} 生成されたHTMLページ
 */
function doGet(e) {
  const userEmail = Session.getActiveUser().getEmail();
  const html = HtmlService.createTemplateFromFile('index');

  if (!userEmail) {
    html.deviceData = []; // データがない場合は空の配列を渡す
    html.userEmail = 'Not Authenticated';
  } else {
    // 複数のデバイス情報を含む配列が返ってくる
    const deviceDataArray = getLatestPackageData(userEmail);
    // 配列全体をテンプレートに渡す
    html.deviceData = deviceDataArray;
    html.userEmail = userEmail;
  }

  return html.evaluate()
             .setTitle('Android Package List Viewer')
             .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
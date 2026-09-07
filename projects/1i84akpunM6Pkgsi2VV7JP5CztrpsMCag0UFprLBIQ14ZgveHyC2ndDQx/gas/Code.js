/**
 * ウェブアプリにGETリクエストがあったときに実行される関数
 * @param {Object} e - イベントオブジェクト
 * @return {HtmlOutput} 生成されたHTMLページ
 */
function doGet(e) {
  const folders = DriveApp.getFoldersByName('gas');
  let spreadsheetList = [];
  if (folders.hasNext()) {
    const folder = folders.next();
    const files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
    while (files.hasNext()) {
      const file = files.next();
      spreadsheetList.push({
        name: file.getName(),
        url: file.getUrl()
      });
    }
  }
  const template = HtmlService.createTemplateFromFile('index');
  template.spreadsheetList = spreadsheetList;
  return template.evaluate()
      .setTitle('Google Drive Spreadsheet List')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
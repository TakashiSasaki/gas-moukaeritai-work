//filename: doGet.gs

function doGet(e) {
  // パラメータ無しで呼び出された場合、index.htmlを表示
  return HtmlService.createHtmlOutputFromFile('index');
}

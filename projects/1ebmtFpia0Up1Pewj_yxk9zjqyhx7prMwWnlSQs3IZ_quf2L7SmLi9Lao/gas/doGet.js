/**
 * Webアプリケーションのメインエントリーポイント
 * GETリクエストを処理し、HTMLテンプレートを返します。
 * * @param {Object} e HTTPリクエストイベントオブジェクト
 * @return {HtmlService.HtmlOutput} 評価済みのHTML出力
 */
function doGet(e) {
  // テンプレートファイル 'index.html' を読み込み
  const template = HtmlService.createTemplateFromFile('index');
  
  // HTMLを評価し、メタデータ（タイトル、Viewportなど）を設定して返す
  return template.evaluate()
    .setTitle('Google Tasks Manager')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) // 任意のiframe埋め込み許可（必要に応じて変更）
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * HTMLテンプレート内で外部ファイル（CSS/JS等）を読み込むためのヘルパー関数
 * <?!= include('Stylesheet'); ?> のように使用します。
 * * @param {string} filename 読み込むファイル名（拡張子 .html を除く）
 * @return {string} ファイルの内容
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
/**
 * Webアプリとしてアクセスされた場合に呼び出される関数。
 * index.html をクライアントに返します。
 */
function doGet(e) {
  // HTML テンプレートをファイルから作成
  const htmlOutput = HtmlService.createHtmlOutputFromFile('index');
  
  // Webアプリのタイトルを設定
  htmlOutput.setTitle('Google Drive ファイル一覧書き出し');
  
  // モバイルデバイスでの表示を最適化
  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  
  return htmlOutput;
}
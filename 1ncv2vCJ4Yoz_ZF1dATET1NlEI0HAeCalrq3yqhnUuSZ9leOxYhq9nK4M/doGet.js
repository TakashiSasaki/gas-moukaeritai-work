/**
 * @fileoverview Webアプリケーションのメインエントリポイント。
 * GETリクエストを処理し、ユーザーインターフェースを提供します。
 */

/**
 * WebアプリケーションへのHTTP GETリクエストを処理します。
 *
 * @param {Object} e GETリクエストのイベントパラメータ。
 * @return {HtmlOutput} HTMLサービスの出力。
 */
function doGet(e) {
  // createHtmlOutputFromFileの代わりにcreateTemplateFromFileを使用し、
  // HTML内の <?!= ... ?> のようなスクリプトレットを処理できるようにします。
  const template = HtmlService.createTemplateFromFile('index');

  // evaluate() メソッドは、テンプレート内のスクリプトレットを実行し、
  // HtmlOutputオブジェクトを返します。これは、サーバーサイドのコンテンツや
  // 他のHTMLファイルをインクルードするために不可欠なステップです。
  const htmlOutput = template.evaluate();

  // 最終的なHtmlOutputオブジェクトにタイトルやメタデータを設定します。
  htmlOutput
    .setTitle('DNS Record Extractor')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');

  return htmlOutput;
}

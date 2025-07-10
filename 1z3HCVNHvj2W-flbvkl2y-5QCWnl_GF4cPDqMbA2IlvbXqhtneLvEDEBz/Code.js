/**
 * HTTP GETリクエストを処理し、ウェブアプリケーションのメインページを表示します。
 * @param {Object} e - Apps Scriptによって提供されるイベントオブジェクト。
 * @return {HtmlOutput} ウェブページを表示するためのHtmlOutputオブジェクト。
 */
function doGet(e) {
  // 'index.html' をHTMLテンプレートとして読み込みます。
  // evaluate()メソッドにより、テンプレート内のスクリプトレット（<?!= ... ?>）が実行されます。
  var htmlOutput = HtmlService.createTemplateFromFile('index').evaluate();
  
  // ウェブページのタイトルを設定します。
  htmlOutput.setTitle('Moodle 多肢選択問題チェッカー');

  // 必要に応じて、他のサイトへの埋め込みを許可する場合に以下の行のコメントを解除します。
  // htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  return htmlOutput;
}

// 注意:
// このスクリプトを実行（デプロイ）する前に、
// Google Apps Scriptプロジェクトに以下のファイルが作成されていることを確認してください。
// 1. index.html （メインのHTMLファイル）
// 2. css.html   （スタイル定義を<style>タグで囲んだHTMLファイル）
// 3. script.html（JavaScriptコードを<script>タグで囲んだHTMLファイル）
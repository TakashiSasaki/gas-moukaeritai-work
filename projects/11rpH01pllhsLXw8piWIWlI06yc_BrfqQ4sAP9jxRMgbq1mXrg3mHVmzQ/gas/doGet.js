/**
 * HTTP GETリクエストを処理し、ウェブページを表示します。
 * この関数は、Google Apps Scriptのウェブアプリとしてデプロイされた際に呼び出されます。
 * @param {Object} e イベントオブジェクト。リクエストパラメータなどが含まれます。
 * @return {HtmlOutput} 表示するHTML出力オブジェクト。
 */
function doGet(e) {
  // 'index.html'という名前のHTMLファイルからHTMLテンプレートを生成します。
  const template = HtmlService.createTemplateFromFile('index');
  
  // テンプレートを評価してHTML出力を生成します。
  // これにより、index.html内のスクリプトレット (例: <?!= ... ?>) が処理されます。
  const htmlOutput = template.evaluate();
  
  // ウェブページのタイトルを設定します。
  htmlOutput.setTitle('コンテンツパネルアップローダー');
  
  // iframe内での表示を許可します。
  // これにより、他のウェブページに埋め込むことが可能になります。
  htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  
  // サンドボックスモードを設定します。
  // IFRAMEモードは、セキュリティを強化しつつ、いくつかのHTML5機能（localStorageなど）の利用を可能にします。
  htmlOutput.setSandboxMode(HtmlService.SandboxMode.IFRAME);
  
  // 生成されたHTML出力を返します。
  return htmlOutput;
}

/**
 * この関数は、doGetから呼び出されることはありませんが、
 * スクリプトエディタから直接実行してテストする際などに、
 * ログ出力やセットアップ処理を記述するために便利です。
 * 今回は特に処理はありません。
 */
function myFunction() {
  Logger.log("myFunctionが実行されました。doGet関数をテストするには、ウェブアプリとしてデプロイしてください。");
}

/**
 * ウェブアプリのエントリーポイント (GETリクエスト)
 * @param {Object} e HTTP GET リクエストのイベントオブジェクト
 */
function doGet(e) {
  const page = (e && e.parameter && e.parameter.p) ? e.parameter.p : 'Index';
  
  try {
    const template = HtmlService.createTemplateFromFile(page);
    
    // アプリ自身のURLをテンプレートに注入
    try {
      template.appUrl = ScriptApp.getService().getUrl();
    } catch (err) {
      template.appUrl = '#'; 
    }

    return template
      .evaluate()
      .setTitle('Drive Shallow Mover')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    console.error('Page not found, falling back to Index: ' + page);
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Drive Shallow Mover')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}
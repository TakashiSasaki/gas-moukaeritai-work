/**
 * Web.gs
 * WebアプリケーションのエントリーポイントとHTML提供
 */

function doGet(e) {
  const template = HtmlService.createTemplateFromFile('index');
  
  return template.evaluate()
      .setTitle('Web Clip Stash') 
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
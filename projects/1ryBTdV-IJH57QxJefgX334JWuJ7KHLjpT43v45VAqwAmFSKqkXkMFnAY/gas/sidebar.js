/**
  import HTML/CSS/JS from JSDO.IT and show it in UI sidebar.
  
  @param ui {Ui}
  @param jsdoitUser {string}
  @param jsdoitCodeId {string}
  @param templateParameter {object} optional
  @return {void}
*/
function showSidebar_(ui, jsdoitUser, jsdoitCodeId, templateParameter){
  var jsdoitPrefix = jsdoitUser + "/" + jsdoitCodeId + "/";
  
  var html = CacheService.getScriptCache().get(jsdoitPrefix);
  if(html === null) {
    html = UrlFetchApp.fetch("http://jsrun.it/" + jsdoitPrefix).getContentText();
    CacheService.getScriptCache().put(jsdoitPrefix + "html", html, 30);
  }
  var m = html.match(/<title>(.+) - js do it<\/title>/);
  var title = m[1];

  var body = CacheService.getScriptCache().get(jsdoitPrefix + "html");
  if(body === null) {
    body = UrlFetchApp.fetch("http://jsrun.it/" + jsdoitPrefix +"html").getContentText();
    CacheService.getScriptCache().put(jsdoitPrefix + "body", body, 30);
  }
  var css = CacheService.getScriptCache().get(jsdoitPrefix + "css");
  if(css === null) {
    css = UrlFetchApp.fetch("http://jsrun.it/" + jsdoitPrefix + "css").getContentText();
    CacheService.getScriptCache().put(jsdoitPrefix + "css", css, 30);
  }
  var js = CacheService.getScriptCache().get(jsdoitPrefix + "js");
  if(js === null) {
    js = UrlFetchApp.fetch("http://jsrun.it/" + jsdoitPrefix +"js").getContentText();
    CacheService.getScriptCache().put(jsdoitPrefix + "js", js, 30);
  }
  var bodyTemplate = HtmlService.createTemplate(body);
  
  if(templateParameter !== undefined) {
    for(var i in templateParameter){
      bodyTemplate[i] = templateParameter[i];
    }
  }
  var sidebar = HtmlService.createTemplateFromFile("sidebarTemplate");
  sidebar.body = bodyTemplate.evaluate().getContent();
  sidebar.css = css;
  sidebar.js = js;
  ui.showSidebar(sidebar.evaluate().setTitle(title));
}


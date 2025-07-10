function onInstall(e) {
  Logger.log("onInstall");
  onOpen(e);
}

function onOpen(e){
  Logger.log("onOpen");
  ScriptCatalog.register(e);
  var ui = SpreadsheetApp.getUi();
  Logger.log(ui);
  var html_template = HtmlService.createTemplateFromFile("index");
  var html_output = html_template.evaluate();
  ui.createAddonMenu().addItem("open", "onOpen").addToUi();
  ui.showSidebar(html_output);
}

function aaa(e){
  alert(e);
}
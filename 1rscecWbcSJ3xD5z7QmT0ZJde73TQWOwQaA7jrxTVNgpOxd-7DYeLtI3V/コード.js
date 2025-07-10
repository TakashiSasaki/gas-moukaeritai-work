function doGet(e) {
  given_parameter = JSON.stringify(e);
  active_user = Session.getActiveUser();
  effective_user = Session.getEffectiveUser();
  json_string = JSON.stringify(e);
  var html_template = HtmlService.createTemplateFromFile("index");
  var html_output = html_template.evaluate();
  html_output.setSandboxMode(HtmlService.SandboxMode.IFRAME);
  return html_output;
}

function doPost(e) {
  Logger.log(e);
  Logger.log(e.postData.getDataAsString());
  return doGet(e);
}

function onInstall(e){
  onOpen(e);
}

function onOpen(e){
  FormApp.getUi().showSidebar();
}

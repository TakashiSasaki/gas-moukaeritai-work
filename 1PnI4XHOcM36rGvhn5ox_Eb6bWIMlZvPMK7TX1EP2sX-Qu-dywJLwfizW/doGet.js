function doGet(e) {
  CacheService.getUserCache().put("email", Session.getUser().getEmail());
  const htmlTemplate = HtmlService.createTemplateFromFile(e.parameter.page ? e.parameter.page : "index");
  const htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("Slack Delete Old Messages");
  return htmlOutput;
}

function getCallbackUrl() {
  ScriptApp.newStateToken
  const webAppUrl = ScriptApp.getService().getUrl();
  const callbackUrl = webAppUrl.replace("/dev", "/usercallback").replace("/exec", "/usercallback");
  return callbackUrl;
}

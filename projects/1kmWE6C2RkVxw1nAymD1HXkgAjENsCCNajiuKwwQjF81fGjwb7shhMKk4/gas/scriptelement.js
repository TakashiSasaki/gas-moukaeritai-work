function scriptElement(clientId) {
  var htmlTemplate = HtmlService.createTemplateFromFile("js");
  htmlTemplate.clientId = clientId;
  var htmlOutput = htmlTemplate.evaluate();
  return htmlOutput.getContent();
}


function doGet(e) {
  Logger.log(e);
  if(e.parameters.hex) {
    var resultHex = xorHexStrings(e.parameters.hex);
    var textOutput = ContentService.createTextOutput(resultHex).setMimeType(ContentService.MimeType.TEXT);
    return textOutput;
  }
  if("base64Alphabet" in e.parameters){
    var htmlTemplate = HtmlService.createTemplateFromFile("base64Alphabet");
    var htmlOutput = htmlTemplate.evaluate().setTitle("base64Alphabet");
    return htmlOutput;
  }
  if("base64XorTable" in e.parameters) {
    var htmlTemplate = HtmlService.createTemplateFromFile("base64XorTable");
    htmlTemplate.base64XorTable = getBase64XorTable();
    var htmlOutput = htmlTemplate.evaluate();
    return htmlOutput;
  }
  if("base64WebSafeXorTable" in e.parameters) {
    var htmlTemplate = HtmlService.createTemplateFromFile("base64WebSafeXorTable");
    htmlTemplate.base64WebSafeXorTable = getBase64WebSafeXorTable();
    var htmlOutput = htmlTemplate.evaluate();
    return htmlOutput;
  }
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  htmlTemplate.xorTable = makeXorTable();
  htmlTemplate.productTable = makeProductTable();
  var htmlOutput = htmlTemplate.evaluate();
  return htmlOutput;
}

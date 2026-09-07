function doGet(e) {
  if(e.parameter.test !== undefined){
    var htmlTemplate = HtmlService.createTemplateFromFile("test");
    var htmlOutput = htmlTemplate.evaluate();
    htmlOutput.setTitle("Markedjs in Google Apps Script");
    return htmlOutput;
  }
  
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  var htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("Markdown in Sheet Addon");
  return htmlOutput;
}//doGet
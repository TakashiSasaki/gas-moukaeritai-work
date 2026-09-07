function doGet() {
  var htmlTemplate = HtmlService.createTemplateFromFile("demo");
  var htmlOutput = htmlTemplate.evaluate().setTitle("File Picker");
  return htmlOutput;
}

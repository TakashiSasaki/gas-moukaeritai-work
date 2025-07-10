function doGet() {
  const htmlTemplate = HtmlService.createTemplateFromFile("index");
  const htmlOutput = htmlTemplate.evaluate();
  return htmlOutput;
}

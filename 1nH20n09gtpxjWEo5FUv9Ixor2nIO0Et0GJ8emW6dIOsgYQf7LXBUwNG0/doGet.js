function doGet() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile("index");
  htmlOutput.setTitle("Hash");
  return htmlOutput;
}

function doGet() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile("index");
  htmlOutput.setTitle("Mozilla PDF.js in Google Apps Script");
  return htmlOutput;
}

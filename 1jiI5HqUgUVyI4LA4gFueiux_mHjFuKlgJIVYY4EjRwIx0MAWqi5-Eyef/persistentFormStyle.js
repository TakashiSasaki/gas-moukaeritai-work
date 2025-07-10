function persistentFormStyle() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile("persistentFormCss");
  return htmlOutput.getContent();
}//persistentFormStyle


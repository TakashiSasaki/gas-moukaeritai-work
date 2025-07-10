function persistentFormScript() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile("persistentFormJs");
  return htmlOutput.getContent();
}//persistentFormScript

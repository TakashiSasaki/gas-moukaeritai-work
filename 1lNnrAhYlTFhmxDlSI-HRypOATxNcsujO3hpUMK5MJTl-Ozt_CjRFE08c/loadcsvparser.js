/**
  load CsvParser in a script tag.
  @returns {String} script tag embracing CsvParser.
*/
function loadCsvParser(){
  var htmlOutput = HtmlService.createHtmlOutputFromFile("CsvParser.js");
  return htmlOutput.getContent();
}

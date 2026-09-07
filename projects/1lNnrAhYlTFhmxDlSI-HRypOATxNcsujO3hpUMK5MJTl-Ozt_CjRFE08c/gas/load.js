/**
  load CsvParser in a script tag.
  @returns {String} script tag embracing CsvParser.
*/
function load(){
  var htmlOutput = HtmlService.createHtmlOutputFromFile("CsvParser.js");
  return htmlOutput.getContent();
}

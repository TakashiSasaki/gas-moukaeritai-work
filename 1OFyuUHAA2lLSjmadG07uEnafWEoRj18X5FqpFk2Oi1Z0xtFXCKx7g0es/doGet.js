function doGet(e) {
  if(e.parameter.csvEnglish){
    var records = getKenqwebRecords();
    records.unshift(englishHeader);
    var csv = toCsv(records);
    var text = csv.join("");
    var textOutput = ContentService.createTextOutput(text);
    textOutput.downloadAsFile("E06-English.csv");
    textOutput.setMimeType(ContentService.MimeType.CSV);
    return textOutput;
  }
  if(e.parameter.csvJapanese){
    var records = getKenqwebRecords();
    records.unshift(japaneseHeader);
    var csv = toCsv(records);
    var textOutput = ContentService.createTextOutput(csv.join(""));
    textOutput.downloadAsFile("E06-Japanese.csv");
    textOutput.setMimeType(ContentService.MimeType.CSV);
    return textOutput;
  }
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  var htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("kenqweb2 to researchmap CSV converter ");
  return htmlOutput;
}

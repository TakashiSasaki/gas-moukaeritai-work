function testTsvDocument() {
  var text = "a\tb\tc\nd\te\tf";
  var result = CsvParser.tsvDocument(text);
  Logger.log(result);
}

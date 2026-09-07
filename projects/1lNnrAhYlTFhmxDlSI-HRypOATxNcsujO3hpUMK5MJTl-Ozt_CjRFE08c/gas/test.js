function test() {
  var CsvParser = require("CsvParser");
  Logger.log(CsvParser.csvDocument("a,b,c\nd,e,f"));
  Logger.log(CsvParser.tsvField("abc"));
}

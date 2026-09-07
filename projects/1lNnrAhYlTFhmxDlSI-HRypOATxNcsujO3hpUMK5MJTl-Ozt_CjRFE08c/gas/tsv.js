/**
  @param {string} text
  @returns {string}
*/
function tsvSeparator(text) {
  if(text === undefined) text = "\t";
  
  var x = require("CsvParser");
  var result = x.tsvSeparator(text);
  return result;
}

/**
  @param {string} text
  @returns {string}
*/
function tsvField(text) {
  if(text === undefined) text = "abc";
  var x = require("CsvParser");
  Logger.log(typeof x.tsvField);
  var result = x.tsvField(text);
  Logger.log(result);
  return result;
}

/**
  @param tsvString {string}
  @return {[[string|number|boolean|null]]}
*/
function tsvDocument(tsvString){
  var csvParser = require("CsvParser");
  var result = csvParser.tsvDocument(x);
  return result;
}

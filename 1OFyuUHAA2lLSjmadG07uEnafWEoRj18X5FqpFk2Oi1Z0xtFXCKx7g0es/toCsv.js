/**
  @param {String[][]} records
  @returns {String[]}
*/
function toCsv(records) {
  var result = [];
  for(var i=0; i<records.length; ++i) {
    var record = records[i];
    if(record.length === 0) continue;
    for(var j=0; j<record.length-1; ++j) {
      result.push(JSON.stringify(record[j]));
      result.push(",");
    }
    result.push(JSON.stringify(record[record.length-1]));
    result.push("\n");
  }
  return result;
}

function testToCsv(){
  var records = [[1.2, "hello\tworld", "good\nmorning"], []];
  var result = toCsv(records);
  Logger.log(result.join(""));
}

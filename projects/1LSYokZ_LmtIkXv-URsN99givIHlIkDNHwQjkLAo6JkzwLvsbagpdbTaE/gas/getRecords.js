/**
  @param {Sheet} sheet
  @returns {Object[]}
*/
function getRecords(sheet){
  if(sheet === undefined) {
    sheet = SpreadsheetApp.getActiveSheet();
  }
  var header = getHeader(sheet);
  var range = sheet.getDataRange();
  var values = range.getValues();
  var objects = [];
  for(var i=1; i<values.length; ++i){
    var object = {};
    for(var j in values[i]) {
      var value = values[i][j];
      if(value.substr(0,0) === "'") {
        value = value.substr(1);
      }
      object[header[j]] = value;
    }
    objects.push(object);
  }
  return objects;
}

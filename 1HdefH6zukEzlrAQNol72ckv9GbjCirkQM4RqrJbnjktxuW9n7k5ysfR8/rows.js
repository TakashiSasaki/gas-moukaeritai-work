spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
sheet = spreadsheet.getActiveSheet();

function appendRows(rows) {
  if(rows === undefined) {
    rows = JSON.parse(CacheService.getUserCache().get("values"));
  }
  var sheet = SpreadsheetApp.getActiveSheet();
  var dataRange = sheet.getDataRange();
  var newRange = sheet.getRange(dataRange.getHeight()+1, 1, rows.length, rows[0].length);
  newRange.setValues(rows);
}

function appendLog(message /* any number of arguments can be given */){
  if(message === undefined) {
    var rowValues = JSON.parse(CacheService.getUserCache().get("values"))[0];
  } else {
    var rowValues = Array.prototype.concat.apply([],arguments);
  }
  var logValues = [new Date()].concat(rowValues);
  appendRows([logValues]);
}

function clearDuplicatedRows() {
  var range = SpreadsheetApp.getActiveRange();
  var values = range.getValues();
  var hashValues = values.map(function(x){
    var jsonString = JSON.stringify(x);
    var byteArray = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, jsonString);
    var hashString = Utilities.base64Encode(byteArray);
    Logger.log(hashString);
    return hashString;
  });
  Logger.log(hashValues);
  for(var i=0; i<hashValues.length; ++i) {
    for(var j=i+1; j<hashValues.length; ++j) {
      if(hashValues[i]===hashValues[j]) values[j] = values[0].map(function(){return null});
    }
  }
  range.setValues(values);
}

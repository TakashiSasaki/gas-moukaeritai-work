function breakoutHexRange(){
  var lock = LockService.getDocumentLock();
  lock.waitLock(1000);
  var values = SpreadsheetApp.getActiveRange().getValues();
  var sheetName = PropertiesService.getDocumentProperties().getProperty("breakoutSheetName");
  if(sheetName === null) {
    sheetName = (new Date()).toString();
    PropertiesService.getDocumentProperties().setProperty("breakoutSheetName", sheetName);
  }
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if(sheet === null) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
  }
  sheet.activate();
  trimSheet();

  var rows = [];
  for(var i in values) {
    var beginHex = values[i][0];
    var begin = parseInt(beginHex, 16);
    var endHex =  values[i][1];
    if(endHex) {
      var end = parseInt(endHex, 16);
    } else {
      var end = begin;
    }
    for(var j=begin; j<=end; ++j) {
      var row = [i];
      var hex = j.toString(16);
      var hexUpperCase = hex.toUpperCase();
      if(hexUpperCase.length<=4){
        row.push("'" + ("0000" + hexUpperCase).slice(-4));
      } else {
        row.push("'" + hexUpperCase);
      }
      for(var k=2; k<values[i].length;++k){
        row.push("'"+values[i][k]);
      }
      rows.push(row);
      if(rows.length >= 2000) {
        var appendedRange = appendRows(sheet,rows);
        sheet.setActiveRange(appendedRange);
        rows = [];
      }
    }
  }
  appendRows(sheet,rows);
  lock.releaseLock();
}

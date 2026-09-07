/** 
  @param {Sheet} sheet
  @returns {String[]}
*/
function getColumnNames(sheet){
  if(sheet === undefined) {
    sheet = SpreadsheetApp.getActiveSheet();
  }
  if(sheet.getFrozenRows() == 0) throw new Error("one row should be frozen.");
  var maxColumns = sheet.getMaxColumns();
  var headerRange = sheet.getRange(1, 1, 1, maxColumns);
  var headerValues = headerRange.getValues();
  var header = [];
  for(var i in headerValues[0]){
    var headerName = headerValues[0][i];
    if(headerName.substr(0,0) === "'") {
      headerName = headerName.substr(1);
    }
    header.push(headerName);
  }
  return header;
}

/** @customfunction*/
function JSON_PARSE_NOTE(key) {
  LockService.getDocumentLock().waitLock(10000);
  var maxRows =  SpreadsheetApp.getActiveSheet().getMaxRows();
  var row =  SpreadsheetApp.getActiveRange().getRow();
  var column = SpreadsheetApp.getActiveRange().getColumn();
  var sourceRange = SpreadsheetApp.getActiveSheet().getRange(row, 1, maxRows-row+1, 1);
  var sourceNotes = sourceRange.getNotes();
  var targetRange = SpreadsheetApp.getActiveSheet().getRange(row, column, maxRows-row+1, 1);
  var targetValues = [];
  for(var i=0; i<= sourceNotes.length; ++i){
    var note = sourceNotes[i];
    try {
      var object = JSON.parse(note);
      var value = object[key];
    } catch (e){
      var value = e;      
    }
    if(key.match(/^\".+\"$/)) {
      var json = JSON.stringify(object[JSON.parse(key)]);
      var value = json;
    }
    targetValues.push([value]);
  }
  return targetValues;
}//JSON_PARSE_NOTE

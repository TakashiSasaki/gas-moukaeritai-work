/** 
  @param {Date} date
  @returns {Number} time as a float value to be set to a cell
*/
function convertDateToFloat(date) {
  var epoch = date.getTime()/1000;
  return  epoch / 86400 + 25569;    
}

function swapValuesAndNotes(){
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getSelection().getActiveRange();
  var values = range.getValues();
  var notes = range.getNotes();
  range.setValues(notes);
  range.setNotes(values);
}

function setCurrentDateTime(){
  var cell = SpreadsheetApp.getActiveRange().getCell(1,1);
  var currentDateTime = dateToFloat(new Date());
  cell.setValue(currentDateTime)
  cell.setNumberFormat("yyyy/MM/dd HH:mm:ss Z");
}

function getValuesAsJson(){
  return JSON.stringify(SpreadsheetApp.getActiveRange().getValues());
}

function setValuesAsJson(jsonValues){
  var values = JSON.parse(jsonValues);
  var cursorRange = SpreadsheetApp.getActiveRange();
  var rowIndex = cursorRange.getRow();
  var columnIndex = cursorRange.getColumn();
  var height = values.length;
  var width = values[0].length;
  var targetRange = SpreadsheetApp.getActiveSheet().getRange(rowIndex, columnIndex, height, width);
  targetRange.setValues(values);
}

function appendValuesAsJson(jsonValues){
  var values = JSON.parse(jsonValues);
  var rowIndex = SpreadsheetApp.getActiveSheet().getLastRow() + 1;
  var columnIndex = 1;
  var height = values.length;
  var width = values[0].length;
  var targetRange = SpreadsheetApp.getActiveSheet().getRange(rowIndex, columnIndex, height, width);
  targetRange.setValues(values);
}


function trimSheet(sheet){
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastColumn = sheet.getLastColumn();
  if(lastColumn == 0) {
    lastColumn = 1;
  }
  var lastRow =  sheet.getLastRow();
  if(lastRow == 0) {
    lastRow = 1;
  }
  if(sheet.getMaxColumns() > lastColumn) {
    sheet.deleteColumns(lastColumn + 1, sheet.getMaxColumns() - lastColumn);
  }
  if(sheet.getMaxRows() > lastRow) {
    sheet.deleteRows(lastRow + 1, sheet.getMaxRows() - lastRow);
  }
}

function fillBlankCells(fillValue){
  var range = SpreadsheetApp.getActiveRange();
  var values = range.getValues();
  for(var i = 0; i<values.length; ++i){
    for(var j = 0; j<values[i].length; ++j) {
      var value = values[i][j];
      if(value === undefined || value === null || value === "") {
        values[i][j] = fillValue;
      }//if
    }//for
  }//for
  range.setValues(values);
}

function fillBlankByLeft(){
  var range = SpreadsheetApp.getActiveRange();
  if(range.getWidth()!==2) throw "Range should have two columns";
  var values = range.getValues();
  for(var i in values) {
    if(values[i][1] === undefined || values[i][1] === null || values[i][1] === "") {
      values[i][1] = "'" + values[i][0];
    } else {
      values[i][1] = "'" + values[i][1];
    }
    values[i][0] = "'" + values[i][0];
  }
  range.setValues(values);
}

function fillBlankByRight(){
  var range = SpreadsheetApp.getActiveRange();
  if(range.getWidth()!==2) throw "Range should have two columns";
  var values = range.getValues();
  for(var i in values) {
    if(values[i][0] === undefined || values[i][0] === null || values[i][0] === "") {
      values[i][0] = "'" + values[i][1];
    } else {
      values[i][1] = "'" + values[i][0];
    }
    values[i][1] = "'" + values[i][1];
  }
  range.setValues(values);
}
function moveToTop(row){
  if(typeof row === "string" && row === "") {
    var source = sheet.getActiveRange();
  } else {
    var sheet = SpreadsheetApp.getActiveSheet();
    if(row <= sheet.getFrozenRows()+1) return;
    var source = sheet.getRange(row, 1, 1, sheet.getMaxColumns());
  }
  sheet.moveRows(source, sheet.getFrozenRows()+1);
}

function moveToLeftmost(column){
  if(typeof column === "string" && column === "") {
    var source = sheet.getActiveRange();
  } else {
    var sheet = SpreadsheetApp.getActiveSheet();
    if(column <= sheet.getFrozenColumns()+1) return;
    var source = sheet.getRange(1, column, sheet.getMaxRows(), 1)
  }
  sheet.moveColumns(source, sheet.getFrozenColumns()+1);
}

function moveToTopLeft(range){
  moveToLeftTop(range);
}

function moveToLeftTop(range){
  LockService.getDocumentLock().tryLock(500);
  Logger.log(range);
  if(range === undefined) {
    range = SpreadsheetApp.getActiveRange();
  } else if(typeof range.range === "object") {
    range = range.range;
  }
  var row = range.getRow();
  Logger.log(row);
  var column = range.getColumn();
  Logger.log(column);
  moveToTop(row);
  moveToLeftmost(column);
  LockService.getDocumentLock().releaseLock();
}

function twoInLeft(){
  LockService.getDocumentLock().tryLock(500);
  var range = SpreadsheetApp.getActiveRange();
  if(range.getWidth() !== 2) throw "The range should have two columns.";
  var values = range.getValues();
  for(var i=0; i<values.length; ++i){
    values[i][0] = values[i][0] + "\n" + values[i][1];
  }
  range.setValues(values);
  LockService.getDocumentLock().releaseLock();
  return "Done.";
}

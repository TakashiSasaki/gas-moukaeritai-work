function showDatabaseSidebar(e){
  Logger.log(e);
  var htmlOutput = HtmlService.createTemplateFromFile("database").evaluate().setTitle("Database");
  var ui = SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

function setHeader(header){
  if(typeof header === "string") header = JSON.parse(header);
  checkTable();
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange(1,1,1,sheet.getMaxColumns()).clear().clearContent().clearDataValidations().clearFormat().clearNote();
  var values = [[]];
  for(var i=0; i<header.length; ++i) {
    values[0].push(JSON.stringify(header[i]));
  }
  Logger.log(values);
  sheet.getRange(1,2,1,header.length).setValues(values);
}//setHeader

function getHeader(){
  checkTable();
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(1,2, 1, sheet.getLastColumn()-1);
  var values = range.getValues();
  var header = [];
  for(var i=0; i<values[0].length; ++i){
    header.push(JSON.parse(values[0][i]));
  }
  return header;
}//getHeader

function getGvizUrl(query, headers){
   //https://developers.google.com/chart/interactive/docs/querylanguage
   var spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
   var sheetName = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
   var url = "https://docs.google.com/spreadsheets/d/" + spreadsheetId 
           + "/gviz/tq?sheet_name=" + encodeURI(sheetName) 
           + "&headers=" + headers 
           + "&tq=" + encodeURI(query);
   return url;
}

function checkTable(){
  var sheet = SpreadsheetApp.getActiveSheet();
  if(sheet.getFrozenColumns() !== 1) throw "Only leftmost column should be frozen.";
  if(sheet.getFrozenRows() !== 1) throw "Only top row should be frozen.";
  if(sheet.getRange(1,1).getValue() !== "") throw "A1 cell should be empty";
}

function clearTable(){
  checkTable();
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(2, 2, sheet.getMaxRows()-1, sheet.getMaxColumns()-1);
  range.clear().clearNote().clearFormat();
  sheet.autoResizeColumn(1);
}

function addRecords(records){
  throw "TODO";
}

function addObjects(objects){
  throw "TODO";
}

function objectToRecord(row){
  throw "TODO";
}

function recordToObject(row){
  throw "TODO";
}

function renewTable(o){
  clearTable();
  if(typeof o === "string") o = JSON.parse(o);
  
  var sheet = SpreadsheetApp.getActiveSheet();

  var notes = [];
  for(var i=0; i<o.length; ++i){
    notes.push([JSON.stringify(o[i])]);
  }//for
  sheet.getRange(2, 1, notes.length, 1).setNotes(notes);
  
  var header = getHeader();
  
  var values = [];
  for(var i=0; i<o.length; ++i){
    var row = [];
    for(var j=0; j<header.length; ++j){
      var value = o[i][header[j]];
      if(value === undefined) value = null;
      row.push(JSON.stringify(value));
    }//for j
    values.push(row);
  }//for i
  
  sheet.getRange(2, 2, values.length, header.length).setValues(values);
  
  placeCheckbox(sheet.getRange(2, 1, notes.length, 1));
  SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet);
}//updateSheet

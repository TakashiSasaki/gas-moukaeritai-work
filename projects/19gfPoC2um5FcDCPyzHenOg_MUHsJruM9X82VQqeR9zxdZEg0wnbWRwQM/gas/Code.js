function onInstall(e){
  Logger.log("onInstall");
  Logger.log(e);
  onOpen(e);
}

function onOpen(e){
  Logger.log("onOpen");
  Logger.log(e);
  SpreadsheetApp.getUi().createAddonMenu()
  .addItem("List Sheets", "listSheets")
  .addToUi();
}

function doGet(e){
  return HtmlService.createTemplateFromFile("trigger").evaluate().setTitle("Spreadsheet Addon Trigger Settings");
}

function listSheets(){
  var htmlOutput = HtmlService.createTemplateFromFile("sidebar").evaluate().setTitle("Gmail Search Sheets");
  var ui = SpreadsheetApp.getUi();
  ui.showSidebar(htmlOutput);
}

function getSpreadsheet(){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if(spreadsheet) {
    PropertiesService.getUserProperties().setProperty("spreadsheetId", spreadsheet.getId());
  } else { 
    spreadsheet = SpreadsheetApp.openById(PropertiesService.getUserProperties().getProperty("spreadsheetId"));
  }
  Logger.log(spreadsheet);
  return spreadsheet;
}

function getSheetList(){
  var spreadsheet = getSpreadsheet();
  var sheets = spreadsheet.getSheets();
  var sheetNames = [];
  for(var i=0; i<sheets.length; ++i) {
    var sheet = sheets[i];
    sheetNames.push(sheet.getName());
  }
  return sheetNames;
}


function reloadSheet(sheetName){
  if(sheetName === undefined) sheetName = "is:inbox is:important";
  var spreadsheet = getSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  var threads = Gmail.Users.Threads.list(Session.getActiveUser().getEmail(), {q: sheetName, maxResults:1000});
  var values = [];
  var notes = [];
  for(var i=0; i<threads.threads.length; ++i){
    var threadId = threads.threads[i].id;
    var thread = getThreadById(threadId);
    var messages = thread.messages;
    var lastMessage = messages[messages.length-1];
    var subject = "";
    for(var j=0; j<lastMessage.payload.headers.length; ++j){
      var header = lastMessage.payload.headers[j];
      if(header.name === "Subject") {
        subject = header.value;
      }
    }
    var snippet = lastMessage.snippet;
    var internalDate = lastMessage.internalDate;
    values.push([internalDate, subject]);
    notes.push([threadId, snippet]); 
  }
  sheet.getRange(1,1,values.length,2).setValues(values).setNotes(notes);
}

function setSheetName(oldSheetName, newSheetName){
  var spreadsheet = getSpreadsheet();
  var sheet = spreadsheet.getSheetByName(oldSheetName);
  sheet.setName(newSheetName);
  spreadsheet.setActiveSheet(sheet);
  spreadsheet.moveActiveSheet(0);
}

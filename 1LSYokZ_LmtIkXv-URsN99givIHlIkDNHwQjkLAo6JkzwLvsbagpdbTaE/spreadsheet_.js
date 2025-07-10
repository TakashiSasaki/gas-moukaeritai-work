function showSpreadsheetSidebar(){
  var htmlOutput = HtmlService.createTemplateFromFile("spreadsheet").evaluate().setTitle("Spreadsheet");
  var ui = SpreadsheetApp.getUi();
  ui.showSidebar(htmlOutput);
}

function getSpreadsheetId() {
  return SpreadsheetApp.getActiveSpreadsheet().getId();
}

function getSpreadsheetUrl(){
  return SpreadsheetApp.getActiveSpreadsheet().getUrl();
}

function getSpreadsheetName(){
  return SpreadsheetApp.getActiveSpreadsheet().getName();
}

function getDeveloperMetadata(){
  var resource = {dataFilters:[{developerMetadataLookup:{locationType:0}}]};
  var id = SpreadsheetApp.getActiveSpreadsheet().getId();
  var searchMetadataDeveloperResponse = Sheets.Spreadsheets.DeveloperMetadata.search(resource, id);
  return JSON.stringify(searchMetadataDeveloperResponse);
}

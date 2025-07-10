function createNewSpreadsheet(){
  if(PropertiesService.getUserProperties().getProperty("spreadsheet_id")){
    throw new Error("Spreadsheet ID is alreadh set.");
  }
  const spreadsheet = SpreadsheetApp.create("Slack Playground");
  const spreadsheet_id = spreadsheet.getId();
  if(typeof spreadsheet_id !== "string") {
    throw new Error("Failed to create new spreadsheet.");
  }
  PropertiesService.getUserProperties().setProperty("spreadsheet_id", spreadsheet_id);
  return spreadsheet_id;
}

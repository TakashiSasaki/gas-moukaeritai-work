function getSpreadsheet() {
  let spreadsheetId = PropertiesService.getUserProperties().getProperty("SPREADSHEET_ID");
  let ss;
  
  if (spreadsheetId) {
    ss = SpreadsheetApp.openById(spreadsheetId);
    console.log(ss);
  } else {
    const spreadsheetName = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_NAME");
    
    if (spreadsheetName === null || spreadsheetName === '') {
      throw new Error('SPREADSHEET_NAME property is not set or empty.');
    }
    
    ss = SpreadsheetApp.create(spreadsheetName);
    PropertiesService.getUserProperties().setProperty("SPREADSHEET_ID", ss.getId());
    
    const SHEET_NAME = PropertiesService.getScriptProperties().getProperty("SHEET_NAME");
    
    if (SHEET_NAME === null || SHEET_NAME === '') {
      throw new Error('SHEET_NAME property is not set or empty.');
    }
    
    ss.renameActiveSheet(SHEET_NAME);
  }
  
  return ss;
}

function deleteSpreadsheet(){
  let spreadsheetId = PropertiesService.getUserProperties().getProperty("SPREADSHEET_ID");
  
  if (spreadsheetId) {
    DriveApp.getFileById(spreadsheetId).setTrashed(true);
    PropertiesService.getUserProperties().deleteProperty("SPREADSHEET_ID");
  } else {
    throw new Error('SPREADSHEET_ID property is not set.');
  }
}

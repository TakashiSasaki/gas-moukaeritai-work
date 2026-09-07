const mailSpreadsheetName = "Mails from ChatGPT";

function getMailSpreadsheet() {
  const folder = getFolder();

  const mailSpreadsheetId = PropertiesService.getUserProperties().getProperty("mailSpreadheetId");
  if (mailSpreadsheetId instanceof String) {
    const mailSpreadsheet = SpreadsheetApp.openById(mailSpreadsheetId);
    return mailSpreadsheet;
  }//if

  var files = folder.getFilesByName(mailSpreadsheetName);
  const filesArray = [];

  while (files.hasNext()) {
    var file = files.next();
    if (file.getMimeType() === MimeType.GOOGLE_SHEETS) {
      filesArray.push(file);
    }
  }//while

  if (filesArray.length === 0) {
    Logger.log(`Google Sheets file "${mailSpreadsheetName}" not found in the folder "${folderName}".`);
    const spreadsheet = SpreadsheetApp.create(mailSpreadsheetName);
    DriveApp.getFileById(spreadsheet.getId()).moveTo(folder);
    PropertiesService.getUserProperties().setProperty("mailSpreadsheetId", spreadsheet.getId());
    return spreadsheet;
  }

  if (filesArray.length === 1) {
    PropertiesService.getUserProperties().setProperty("mailSpreadheetId", filesArray[0].getId());
    return SpreadsheetApp.open(filesArray[0]);
  }

  Logger.log(`Two or more Google Sheets file "${fileName}" found in the folder "${folderName}".`);
}//getMailSpreadsheet

function getMailSheet(year) {
  if(year === undefined) year = 2023;
  const spreadsheet = getMailSpreadsheet();
  if (spreadsheet === null) {
    throw Error("Failed to open the spreadsheet for holding the list of emails.");
  }
  const sheet = spreadsheet.getSheetByName(`${year}`);
  if(sheet === null){
    const new_sheet = spreadsheet.insertSheet(`${year}`);
    return new_sheet;
  } else {
    return sheet;
  }
}//getMailSheet

function getMailSpreadsheetUrl(){
  const ss = getMailSpreadsheet();
  return ss.getUrl();
}

function getMailSheetUrl(year){
  if(year === undefined) year = 2023;
  const spreadsheet = getMailSpreadsheet();
  const sheet = getMailSheet(year);
  const url = spreadsheet.getUrl() + "#gid=" + sheet.getId();
  console.log(url);
}//getMailSheetUrl
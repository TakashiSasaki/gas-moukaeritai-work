function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const SHEET_NAME = PropertiesService.getScriptProperties().getProperty("SHEET_NAME");

  if (SHEET_NAME === null || SHEET_NAME === '') {
    throw new Error('SHEET_NAME property is not set or empty.');
  }

  let sheet = ss.getSheetByName(SHEET_NAME);

  if (sheet === null) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  return sheet;
}

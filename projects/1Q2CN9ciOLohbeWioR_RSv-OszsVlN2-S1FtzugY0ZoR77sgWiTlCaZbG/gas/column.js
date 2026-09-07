var columnNamesCache = {};

function getColumnNames() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const sheetId = sheet.getSheetId();
  if (typeof columnNamesCache[sheetId] === "object") {
    return columnNamesCache[sheetId];
  }
  const range = sheet.getRange(1, 1, 1, sheet.getMaxColumns());
  const columnNames = range.getValues()[0];
  columnNamesCache[sheetId] = columnNames;
  return columnNamesCache[sheetId];
}

function getColumnIndex(columnName) {
  const columnNames = getColumnNames();
  const iColumnName = columnNames.indexOf(columnName);
  if (iColumnName >= 0) return iColumnName + 1;

  const sheet = SpreadsheetApp.getActiveSheet();
  delete columnNamesCache[sheet.getSheetId()];

  const iEmpty = columnNames.findIndex(x => x === undefined || x === null || x === "");
  if (iEmpty >= 0) {
    sheet
      .getRange(1, iEmpty + 1, 1, 1)
      .setValue(columnName)
      .setNumberFormat("@");
    sheet.setFrozenRows(1);
    return iEmpty + 1;
  }
  sheet
    .getRange(1, columnNames.length + 1, 1, 1)
    .setValue(columnName)
    .setNumberFormat("@");
  sheet.setFrozenRows(1);
  return columnNames.length + 1;
}

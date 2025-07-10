/**
 * Append a row just below existing data range.
 * @param {Object[]} rowValues for new one row.
 * @returns {number} row index in positive number
 */
function appendRow(rowValues) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const dataRange = sheet.getDataRange();
  const newRowIndex = dataRange.getRowIndex() + dataRange.getHeight();
  writeRow(rowValues, newRowIndex);
  //const newRange = sheet.getRange(newRowIndex, 1, 1, rowValues.length);
  //newRange.setNumberFormat("@").setValues([rowValues]);
  //delete keyColumnMapCache[sheet.getSheetId()];
  return newRowIndex;
}

/**
 * Append rows just below existing data range.
 * @param {Object[][]} rowsValues for new range.
 * @returns {number} row index in positive number
 */
function appendRows(rowsValues) {
  if (rowsValues.length === 0) return;
  const sheet = SpreadsheetApp.getActiveSheet();
  const dataRange = sheet.getDataRange();
  const newRowIndex = dataRange.getRowIndex() + dataRange.getHeight();
  const newRange = sheet.getRange(newRowIndex, 1, rowsValues.length, rowsValues[0].length);
  newRange.setNumberFormat("@").setValues(rowsValues);
  //delete keyColumnMapCache[sheet.getSheetId()];
}

/** 
 * Write a row at rowIndex
 * @param {Object[]} rowValues
*/
function writeRow(rowValues, rowIndex) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const targetRange = sheet.getRange(rowIndex, 1, 1, rowValues.length);
  targetRange.setNumberFormat("@").setValues([rowValues]);
}

var keyValueRowIndexMaps = {};

function getKeyValueRowIndexMap(keyColumnName) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const sheetId = sheet.getSheetId();

  if (typeof keyValueRowIndexMaps[sheetId] !== "object") {
    keyValueRowIndexMaps[sheetId] = {};
  }

  if (typeof keyValueRowIndexMaps[sheetId][keyColumnName] === "object") {
    return keyValueRowIndexMaps[sheetId][keyColumnName];
  }

  keyValueRowIndexMaps[sheetId][keyColumnName] = {};

  const keyColumnIndex = getColumnIndex(keyColumnName);
  const keyColumnRange = sheet.getRange(2, keyColumnIndex, sheet.getLastRow() - 1, 1);
  const values = keyColumnRange.getValues();
  keyValueRowIndexMaps[sheetId][keyColumnName]
    = values.reduce(
      (accumulator, currentValue, index) => {
        accumulator[currentValue[0]] = index + 2;
        return accumulator;
      },
      keyValueRowIndexMaps[sheetId][keyColumnName]);
  return keyValueRowIndexMaps[sheetId][keyColumnName];
}

function testGetKeyColumnMap() {
  const sheet = getSheetForDebug("testGetKeys");
  const keyValueRowIndexMap1 = getKeyValueRowIndexMap('"colA"');
  Logger.log(keyValueRowIndexMap1);
  const keyValueRowIndexMap2 = getKeyValueRowIndexMap('"colA"');
  Logger.log(keyValueRowIndexMap2);
}

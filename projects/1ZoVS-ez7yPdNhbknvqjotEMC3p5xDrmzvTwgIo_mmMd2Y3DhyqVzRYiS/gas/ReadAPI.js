function getSheetNames() {
  const ss = getSpreadsheet();
  const sheets = ss.getSheets();
  const sheetNames = sheets.map((sheet) => sheet.getName());
  console.log(sheetNames);
  return sheetNames;
}//getSheetNames

function getXyLabels(sheetName) {
  if (!sheetName) sheetName = "Sheet1";
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Can't open the sheet named ${sheetName}.`);
  const range = sheet.getRange(1, 2, 1, 2);
  const values = range.getValues();
  const xLabel = values[0][0];
  const yLabel = values[0][1];
  console.log(xLabel, yLabel);
  return [xLabel, yLabel];
}//getXyLabels

function getShapes(sheetName) {
  if (!sheetName) sheetName = "Sheet1";
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Can't open the sheet named ${sheetName}.`);
  const range = sheet.getRange(1, 4, 1, 1);
  const values = range.getValues();
  const shapes = values[0][0];
  const array = Array.from(shapes);
  console.log(array);
  return array;
}//getShapes

function getRecentStickers(sheetName) {
  if (!sheetName) sheetName = "Sheet1";
  const lock = LockService.getUserLock();
  lock.waitLock(5000);
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const lastRow = sheet.getLastRow();
  let firstRow = Math.max(2, lastRow - 29);
  console.log(firstRow);
  const range = sheet.getRange(2, 1, lastRow, 4);
  const values = range.getValues();
  const result = [];
  values.forEach(x => {
    if (x[1] && x[2] && x[3]) {
      result.push([x[1], x[2], x[3]]);
    }
  });
  console.log(result);
  return result;
}//getRecentStickers

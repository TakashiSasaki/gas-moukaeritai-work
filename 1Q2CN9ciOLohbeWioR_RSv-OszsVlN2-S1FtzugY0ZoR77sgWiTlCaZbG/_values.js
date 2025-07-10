function _objectToRowValues(obj) {
  const rowValues = [];
  const columnNames = Object.keys(obj);
  for (i in columnNames) {
    const columnIndex = getColumnIndex(JSON.stringify(columnNames[i]));
    rowValues[columnIndex - 1] = JSON.stringify(obj[columnNames[i]]);
  }
  return rowValues;
}

function _objectsToRowsValues(objects) {
  const rowsValues = [];
  for (i in objects) {
    const rowValues = _objectToRowValues(objects[i]);
    rowsValues.push(rowValues);
  }
  return _padRowsValues(rowsValues);
}

function _padRowsValues(rowsValues) {
  const maxLength = rowsValues.reduce((acc, cur) => Math.max(acc, cur.length), 0);
  Logger.log(maxLength);
  for (j in rowsValues) {
    if (rowsValues[j].length < maxLength) {
      rowsValues[j][maxLength - 1] = null;
    }
  }
  return rowsValues;
}

function rowValuesToObject(rowValues){
  const columnNames = _getColumnNames();
  //TODO: 
}
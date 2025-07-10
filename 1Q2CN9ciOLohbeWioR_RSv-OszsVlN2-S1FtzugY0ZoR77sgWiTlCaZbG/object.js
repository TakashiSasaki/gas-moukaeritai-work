/**
 * Append one object just below existing data range.
 * @param {Object} obj
 * @returns {number} row index of appended object in positive integer
 */
function appendObject(obj) {
  const rowValues = _objectToRowValues(obj);
  const newRowIndex = appendRow(rowValues);
  const sheet = SpreadsheetApp.getActiveSheet();
  delete keyValueRowIndexMaps[sheet.getSheetId()];
  return newRowIndex;
}

/**
 * Append objects just below existing data range.
 * @param {Object[]} objects to be appended
 * @returns {number} row index of the first appended object in positive integer
 */
function appendObjects(objects) {
  const rowsValues = _objectsToRowsValues(objects);
  const newRowIndex = appendRows(rowsValues);
  const sheet = SpreadsheetApp.getActiveSheet();
  delete keyValueRowIndexMaps[sheet.getSheetId()];
  return newRowIndex;
}

/**
 * Update an object of corrensponding key.
 * @param {Object}
 * @param {String} keyProperty
 * @returns {number} row index of updated object in positive integer
 * @throws {string} key error
 */
function updateObject(obj, keyProperty) {
  const keyColumnName = JSON.stringify(keyProperty);
  const keyValue = JSON.stringify(obj[keyProperty]);

  if (obj[keyProperty] === undefined) {
    throw "object does not have key property : " + keyProperty;
  }
  const keyValueRowIndexMap = getKeyValueRowIndexMap(keyColumnName);
  if (keyValueRowIndexMap[keyValue] === undefined) {
    throw "No existing object with key : " + keyValue;
  }
  const rowValues = _objectToRowValues(obj);
  const rowIndex = keyValueRowIndexMap[keyValue];
  writeRow(rowValues, rowIndex);
  return rowIndex;
}

function testUpdateObject() {
  const sheet = getSheetForDebug("testUpdateObject");
  sheet.clear();
  appendObject({ "key1": "value1a", "key2": "value2a" });
  appendObject({ "key1": "value1b", "key2": "value2b" });
  appendObject({ "key1": "value1c", "key2": "value2c" });
  appendObject({ "key1": "value1d", "key2": "value2d" });
  try {
    updateObject({ "key1": "value1x", "key2": "value2x" }, "key1");
  } catch (e) {
    Logger.log(e);
  }
  try {
    updateObject({ "key1": "value1c", "key2": "value2x" }, "key1");
  } catch (e) {
    Logger.log(e);
  }
    try {
    updateObject({ "key1": "value1y", "key2": "value2d" }, "key2");
  } catch (e) {
    Logger.log(e);
  }
}//testUpdateObject
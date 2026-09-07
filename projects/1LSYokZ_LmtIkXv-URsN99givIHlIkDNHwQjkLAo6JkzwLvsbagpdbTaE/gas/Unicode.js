Unicode = [];

function hexRangeToSheet(beginHexString, endHexString, sheetName) {
  if(typeof beginHexString === "undefined"){
    var ui = SpreadsheetApp.getUi();
    var promptResponse = ui.prompt("Array of array [[beginHexString1, endHexString1, sheetName1], ...] in JSON", ui.ButtonSet.OK_CANCEL);
    if(promptResponse.getSelectedButton().CANCEL) return;
    arguments.callee(JSON.parse(promptResponse.getResponseText()));
    return;
  }//if
  
  if (
    typeof beginHexString === "object" &&
    beginHexString.constructor.name === "Array"
  ) {
    beginHexString.forEach(function(x) {
      arguments.callee(x[0], x[1], x[2]);
    });
    return;
  } //if

  if (typeof beginHexString === "undefined") {
    var values = SpreadsheetApp.getActiveRange().getValues();
    if (values[0].length !== 3) {
      throw new Error("The active range should have three columns.");
    } //if
    arguments.callee(beginHexString);
    return;
  } //if

  LockService.getDocumentLock().waitLock(1000);
  lock.waitLock(1000);
  var values = SpreadsheetApp.getActiveRange().getValues();
  var sheetName = PropertiesService.getDocumentProperties().getProperty(
    "breakoutSheetName"
  );
  if (sheetName === null) {
    sheetName = new Date().toString();
    PropertiesService.getDocumentProperties().setProperty(
      "breakoutSheetName",
      sheetName
    );
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (sheet === null) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
  }
  sheet.activate();
  trimSheet();

  var begin = parseInt(beginHexString, 16);
  var end = endHexString ? parseInt(endHexString) : end;
  for (var j = begin; j <= end; ++j) {
    var row = [i];
    var hex = j.toString(16);
    var hexUpperCase = hex.toUpperCase();
    if (hexUpperCase.length <= 4) {
      row.push("'" + ("0000" + hexUpperCase).slice(-4));
    } else {
      row.push("'" + hexUpperCase);
    }
    for (var k = 2; k < values[i].length; ++k) {
      row.push("'" + values[i][k]);
    }
    rows.push(row);
    if (rows.length >= 2000) {
      var appendedRange = appendRows(sheet, rows);
      sheet.setActiveRange(appendedRange);
      rows = [];
    } //if
  } //for
  appendRows(sheet, rows);
} //hexRangeToSheet

Unicode.push([hexRangeToSheet, "Append hex strings in ranges to sheets"]);

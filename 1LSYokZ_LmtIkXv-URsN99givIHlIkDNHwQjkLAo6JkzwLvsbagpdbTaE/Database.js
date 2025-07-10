function appendObject() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var ui = SpreadsheetApp.getUi();
  if (sheet.getFrozenRows() != 1) {
    ui.alert("One frozon row is required.");
    return;
  } //if
  var promptResponse = ui.prompt(
    [
      "Add JSON object as a row",
      "Each key corresponds to column name on the frozen row."
    ].join(" "),
    ui.ButtonSet.OK_CANCEL
  );
  if (promptResponse.getSelectedButton() != ui.Button.OK) return;

  var o = JSON.parse(promptResponse.getResponseText());
  var keys = Object.keys(o);

  var existingFields = sheet
    .getRange(1, 1, 1, sheet.getMaxColumns())
    .getValues()[0];
  console.log(arguments.callee.name + " : existingFields = " + existingFields);

  var l = [];
  for (var j in o) {
    Logger.log(j);
    if (typeof o[j] === "string") {
      l[h.indexOf(j)] = "'" + o[j];
    } else {
      l[h.indexOf(j)] = o[j];
    } //if
  } //for
  Logger.log(JSON.stringify(l));
  if (l.length === 0) {
    ui.alert("nothing appended");
    return;
  }

  var range = sheet.getRange(
    sheet.getDataRange().getHeight() + 1,
    1,
    1,
    l.length
  );
  Logger.log(range.getA1Notation());
  range.setValues([l]);
  var r = SpreadsheetApp.getActiveSheet().getRange(5, 5, 1, 2);
  r.setValues([[null, 1]]);
} //appendObject

appendObject.caption = "Append object to the active sheet";

function appendFieldName(fieldName) {
  if (fieldName === undefined) {
    var ui = SpreadsheetApp.getUi();
    var promptResponse = ui.prompt(
      appendFieldName.name,
      ["Append new header to the leftmost column if it does not exist"].join(
        " "
      ),
      ui.ButtonSet.OK_CANCEL
    );
    fieldName = promptResponse.getResponseText();
  } //if
  //console.log(appendFieldName.name + " : fieldName = " + fieldName); 

  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getFrozenRows() !== 1) {
    throw "One row should be frozed forthe header.";
  } //if

  var existingFields = sheet
    .getRange(1, 1, 1, sheet.getMaxColumns())
    .getValues()[0];
  console.log(arguments.callee.name + " : existingFields + " + existingFields); 
  
  if (existingFields.indexOf(fieldName) >= 0) return;
  for (var i = existingFields.length - 1; i >= 0; --i) {
    if (existingFields[i] !== "") {
      existingFields[i + 1] = fieldName;
      sheet
        .getRange(1, 1, 1, existingFields.length)
        .setValues([existingFields]);
      return;
    } //if
  } //for
  sheet.getRange(1, 1, 1, 1).setValue(fieldName);
} //appendFieldName
appendFieldName.caption = "Append a string at the rightmost cell of the first row";


function setSpecialValuesToCells() {
  var ui = SpreadsheetApp.getUi();
  var button = ui.alert(
    [
      "It destroys 3 rows and 3 columns range.",
      "The first row is set to [, undefined, null].",
      "The second row is set to corresponding 'typeof' strings.",
      "The last row is set to JSON strings."
    ].join(" "),
    ui.ButtonSet.OK_CANCEL
  );
  if (button != ui.Button.OK) return;
  valueList = [, undefined, null];

  var sheet = SpreadsheetApp.getActiveSheet();
  var activeRange = sheet.getActiveRange();
  var range = sheet.getRange(
    activeRange.getRow(),
    activeRange.getColumn(),
    3,
    3
  );
  range.setValues([
    valueList,
    valueList.map(function(x) {
      return typeof x;
    }),
    valueList.map(function(x) {
      return JSON.stringify(x);
    })
  ]);
} //setSpecialValuesToCells
setSpecialValuesToCells.title = "Set [, undefined, null] and to the range.";

function showTypeOfValuesInRange() {
  var range = SpreadsheetApp.getActiveRange();
  var values = range.getValues();
  for (var iRow = 0; iRow < values.length; ++iRow) {
    for (var iColumn = 0; iColumn < values[0].length; ++iColumn) {
      var v = values[iRow][iColumn];
      values[iRow][iColumn] = typeof v;
    } //for iColumn
  } //for iRow
  var json = JSON.stringify(values, null, "  ");
  var html = "<pre>" + json + "</pre>";
  var htmlOutput = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    showTypeOfValuesInRange.title
  );
} //showTypeOfValues
showTypeOfValuesInRange.title = showTypeOfValuesInRange.name;

function showJsonOfValuesInRange() {
  var range = SpreadsheetApp.getActiveRange();
  var values = range.getValues();
  for (var iRow = 0; iRow < values.length; ++iRow) {
    for (var iColumn = 0; iColumn < values[0].length; ++iColumn) {
      var v = values[iRow][iColumn];
      values[iRow][iColumn] = JSON.stringify(v);
    } //for iColumn
  } //for iRow
  var html = "<pre>" + values.join("⏎\n") + "</pre>";
  var htmlOutput = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    showJsonOfValuesInRange.title
  );
} //showJsonOfValuesInRange
showJsonOfValuesInRange.title = showJsonOfValuesInRange.name;

function showConstructorNameOfValuesInRange() {
  var values = SpreadsheetApp.getActiveRange().getValues();
  var constructorNames = values.map(function(row) {
    return row.map(function(v) {
      if (v.constructor === undefined || v.constructor.name === undefined) {
        return undefined;
      } else {
        return v.constructor.name;
      }
    });
  });
  var html = "<pre>" + constructorNames.join("⏎\n") + "</pre>";
  var htmlOutput = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    showConstructorNameOfValuesInRange.title
  );
} //showConstructorNameOfValuesInRange
showConstructorNameOfValuesInRange.title =
  "Show v.constructor.name of values in the active range";

function showConstructorNameOfValuesInRangeByToStringCall(){
  var values = SpreadsheetApp.getActiveRange().getValues();
  var constructorNames = values.map(function(row) {
    return row.map(function(v) {
      return Object.prototype.toString.call(v); 
    });
  });
  var html = "<pre>" + constructorNames.join("⏎\n") + "</pre>";
  var htmlOutput = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    showConstructorNameOfValuesInRangeByToStringCall.title
  );
}
showConstructorNameOfValuesInRangeByToStringCall.title = "Show Object.prototype.toString.call(x) of values in the active range";
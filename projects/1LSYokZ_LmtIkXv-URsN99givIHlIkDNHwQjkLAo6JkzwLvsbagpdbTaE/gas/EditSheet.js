function createSheetByDate(){
  var sheetName = (new Date()).toString();
  SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
}//createSheetByDate
createSheetByDate.title = "Create a sheet setting current date and time to its name";

function adjustColumnWidth() {
  var response = SpreadsheetApp.getUi().prompt(
    "max column width",
    SpreadsheetApp.getUi().ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== response.getSelectedButton().OK) return;
  var maxColumnWidth = parseInt(response.getResponseText());

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    lastColumn = 1;
  }
  for (var column = 1; column <= lastColumn; ++column) {
    sheet.autoResizeColumns(column, 1);
    if (maxColumnWidth > 0) {
      var adjustedWidth = sheet.getColumnWidth(column);
      var width = Math.min(maxColumnWidth, adjustedWidth);
      if (adjustedWidth != width) {
        sheet.setColumnWidth(column, width);
      }
    } //if
  } //for
} //adjustColumnWidth
adjustColumnWidth.title = "Adjust column width";

function placeCheckbox() {
  var spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  var sheetId = SpreadsheetApp.getActiveSheet().getSheetId();
  var row = SpreadsheetApp.getActiveRange().getRow();
  var column = SpreadsheetApp.getActiveRange().getColumn();
  var rows = SpreadsheetApp.getActiveRange().getHeight();
  var columns = SpreadsheetApp.getActiveRange().getWidth();

  var resource = {
    "requests": [{
      "repeatCell": {
        "cell": {
          "dataValidation": {
            "condition": {
              "type": "BOOLEAN",
              "values": [{
                "userEnteredValue": "TRUE"
              }, {
                "userEnteredValue": "FALSE"
              }]
            }
          }
        },
        "range": {
          "sheetId": sheetId,
          "startRowIndex": row - 1,
          "endRowIndex": row - 1 + rows,
          "startColumnIndex": column - 1,
          "endColumnIndex": column - 1 + columns
        },
        "fields": "dataValidation",
      },
    }, ]
  };
  Sheets.Spreadsheets.batchUpdate(resource, spreadsheetId);
}//placeCheckbox

placeCheckbox.title = "Place checkboxes on a selection";
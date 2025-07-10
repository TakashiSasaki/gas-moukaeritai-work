Dev = [];
function showSpreadsheetInfo() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var o = {
    getName: SpreadsheetApp.getActive().getName(),
    getActiveRange: SpreadsheetApp.getActiveRange().getA1Notation(),
    getActiveSheet: SpreadsheetApp.getActiveSheet().getName(),
    getActiveSpreadsheet: SpreadsheetApp.getActiveSpreadsheet().getName(),
    getCurrentCell: SpreadsheetApp.getCurrentCell().getA1Notation(),
    getFormUrl: ss.getFormUrl(),
    getId: ss.getId(),
    getMaxIterativeCalculationCycles: ss.getMaxIterativeCalculationCycles(),
    getName: ss.getName(),
    getNumSheets: ss.getNumSheets(),
    getOwner: ss.getOwner().getEmail(),
    getSpreadsheetLocale: ss.getSpreadsheetLocale(),
    getSpreadsheetTimeZone: ss.getSpreadsheetTimeZone(),
    getUrl: ss.getUrl()
  };
  var json = JSON.stringify(o, null, "  ");
  var html = "<pre>" + json + "</pre>";
  var htmlOutput = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    arguments.callee.caption
  );
}//showSpreadsheetInfo
Dev.push([showSpreadsheetInfo, "Show info of active spreadsheet"]);

function showSheetInfo() {
  var s = SpreadsheetApp.getActiveSheet();
  var o = {
    getActiveCell: s.getActiveCell().getA1Notation(),
    getActiveRange: s.getActiveRange().getA1Notation(),
    getCurrentCell: s.getCurrentCell().getA1Notation(),
    getDataRange: s.getDataRange().getA1Notation(),
    getFormUrl: s.getFormUrl(),
    getFrozenColumns: s.getFrozenColumns(),
    getFrozenRows: s.getFrozenRows(),
    getIndex: s.getIndex(),
    getLastColumn: s.getLastColumn(),
    getLastRow: s.getLastRow(),
    getMaxColumns: s.getMaxColumns(),
    getMaxRows: s.getMaxRows(),
    getName: s.getName(),
    getSheetId: s.getSheetId(),
    getSheetName: s.getSheetName(),
    getTabColor: s.getTabColor(),
    getType: "" + s.getType()
  };
  var json = JSON.stringify(o, null, "  ");
  var html = "<pre>" + json + "</pre>";
  var htmlOutput = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, arguments.callee.title);
}//showSheetInfo
Dev.push([showSheetInfo, "Show info of active sheet"]);

function showActiveAndCurrentThings() {
  var o = {
    SpreadsheetApp: {
      getActiveRange: SpreadsheetApp.getActiveRange().getA1Notation(),
      getActiveRangeList: SpreadsheetApp.getActiveRangeList()
        .getRanges()
        .reduce(function(previous, current) {
          previous.push(current.getA1Notation());
          return previous;
        }, []),
      getCurrentCell: SpreadsheetApp.getCurrentCell().getA1Notation(),
      getSelection: {
        getActiveRange: SpreadsheetApp.getSelection()
          .getActiveRange()
          .getA1Notation(),
        getActiveRangeList: SpreadsheetApp.getSelection()
          .getActiveRangeList()
          .getRanges()
          .reduce(function(previous, current) {
            previous.push(current.getA1Notation());
            return previous;
          }, []),
        getCurrentCell: SpreadsheetApp.getSelection()
          .getCurrentCell()
          .getA1Notation()
      } //getSelection
    }, //SpreadsheetApp
    getActiveSheet: {
      getActiveCell: SpreadsheetApp.getActiveSheet()
        .getActiveCell()
        .getA1Notation(),
      getActiveRange: SpreadsheetApp.getActiveSheet()
        .getActiveRange()
        .getA1Notation(),
      getActiveRangeList: SpreadsheetApp.getActiveSheet()
        .getActiveRangeList()
        .getRanges()
        .reduce(function(previous, current) {
          previous.push(current.getA1Notation());
          return previous;
        }, []),
      getCurrentCell: SpreadsheetApp.getActiveSheet()
        .getCurrentCell()
        .getA1Notation(),
      getSelection: {
        getActiveRange: SpreadsheetApp.getActiveSheet()
          .getSelection()
          .getActiveRange()
          .getA1Notation(),
        getActiveRangeList: SpreadsheetApp.getActiveSheet()
          .getSelection()
          .getActiveRangeList()
          .getRanges()
          .reduce(function(previous, current) {
            previous.push(current.getA1Notation());
            return previous;
          }, []),
        getCurrentCell: SpreadsheetApp.getActiveSheet()
          .getSelection()
          .getCurrentCell()
          .getA1Notation()
      } //getSelection
    } //getActiveSheet
  };
  var json = JSON.stringify(o, null, "  ");
  var html = "<pre>" + json + "</pre>";
  var htmlOutput = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    arguments.callee.caption
  );
} //showActiveAndCurrentThings
Dev.push([showActiveAndCurrentThings, "Show info of active and current things"]);

function showRangeStructure() {
  var range = SpreadsheetApp.getActiveRange();
  var o = {
    getA1Notation: range.getA1Notation(),
    getColumn: range.getColumn(),
    getDataRegion: range.getDataRegion().getA1Notation(),
    getDataSourceUrl: range.getDataSourceUrl(),
    getGridId: range.getGridId(),
    getHeight: range.getHeight(),
    getLastColumn: range.getLastColumn(),
    getLastRow: range.getLastRow(),
    getNumColumns: range.getNumColumns(),
    getNumRows: range.getNumRows(),
    getRow: range.getRow(),
    getRowIndex: range.getRowIndex(),
    getWidth: range.getWidth()
  };
  var json = JSON.stringify(o, null, "  ");
  var html = "<pre>" + json + "</pre>";
  var htmlOutput = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    arguments.callee.caption
  );
} //showRangeStructure
Dev.push([showRangeStructure, "Show the structure of active range"]);


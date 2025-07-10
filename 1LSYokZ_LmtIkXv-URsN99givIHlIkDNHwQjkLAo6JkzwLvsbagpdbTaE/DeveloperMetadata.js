function showDeveloperMetadata() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dmList = ss.getDeveloperMetadata();
  var o = [];
  for (var i = 0; i < dmList.length; ++i) {
    var dm = dmList[i];
    o.push({
      getId: dm.getId(),
      getKey: dm.getKey(),
      getColumn: dm
        .getLocation()
        .getColumn()
        .getA1Notation(),
      getLocationType: "" + dm.getLocation().getLocationType(),
      getRow: dm
        .getLocation()
        .getRow()
        .getA1Notation(),
      getSheet: dm
        .getLocation()
        .getSheet()
        .getName(),
      getSpreadsheet: dm
        .getLocation()
        .getSpreadsheet()
        .getName(),
      getValue: dm.getValue(),
      getVisibility: "" + dm.getVisibility()
    });
  }//for
  var json = JSON.stringify(o, null);
    var html = "<pre>" + json + "</pre>";
  var htmlOutput = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    showSheetInfo.title
  );
}//showDeveloperMetadata

showDeveloperMetadata.title = "Sow developer metadata";

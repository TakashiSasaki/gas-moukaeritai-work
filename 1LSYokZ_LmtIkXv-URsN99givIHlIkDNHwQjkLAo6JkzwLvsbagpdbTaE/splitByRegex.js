function splitByRegex() {
  var values = SpreadsheetApp.getActiveRange().getValues();

  var regex = PropertiesService.getDocumentProperties().getProperty("splitByRegex");
  if(regex === null) {
    ///^([0-9A-F]+)[.]*([0-9A-F]*).*; *([^;]+); *([0-9A-F ]*)([G-Z]*)[ ]+#[ ]*([^ ]+) *\[*([0-9]*)\]* *([^;]+)/
    regex = "";
  }
  var promptResponse = SpreadsheetApp.getUi().prompt(regex, SpreadsheetApp.getUi().ButtonSet.OK_CANCEL);
  if(promptResponse.getSelectedButton() === promptResponse.getSelectedButton().CANCEL){
    return;
  }
  var responseText = promptResponse.getResponseText();
  if(responseText !== null && responseText !== undefined && responseText.length > 0) {
    regex = responseText;
  }
  
  var sheetName = PropertiesService.getDocumentProperties().getProperty("splitByRegexSheetName");
  if(sheetName === null) {
    sheetName = (new Date()).toString();
    PropertiesService.getDocumentProperties().setProperty("splitByRegexSheetName", sheetName);
  }
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if(sheet === null) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
  }
  sheet.activate();
  
  var rows = [];
  for(var i=0; i<values.length; ++i) {
    var m = values[i][0].match(new RegExp(regex));
    if(m===null || m===undefined || m.length===0) continue;
    var row = [i];
    for(var j=1; j<m.length; ++j){
      if(typeof m[j] !== "string") throw new Error("i="+i+" j="+j);
      row.push("'"+m[j]);
    }
    rows.push(row);
    if(rows.length > 500) {
      var appendedRange = appendRows(sheet,rows);
      //sheet.appendRow(rows);
      sheet.setActiveRange(appendedRange);
      rows = [];
    }
  }
  
  var appendedRange = appendRows(sheet, rows);
  sheet.setActiveRange(appendedRange);
  
  var promptResponse = SpreadsheetApp.getUi().alert(appendedRange.getHeight() + "rows have been written. Do you save this regular expression ? \n" + regex, Browser.Buttons.YES_NO);
  if(promptResponse == SpreadsheetApp.getUi().Button.YES){
    PropertiesService.getDocumentProperties().setProperty("splitByRegex", regex);
  }
}

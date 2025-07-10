function writeGmailLabelNames(){
  var gmailLabelNames = _getGmailLabelNames();
  var values = [];
  for(var i in gmailLabelNames) {
    values.push([gmailLabelNames[i]]); 
  }//for
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(sheet.getActiveRange().getRow(), sheet.getActiveRange().getColumn(), values.length);
  range.setValues(values);
  range.clearFormat();
}//writeGmailLabelNames

function _getGmailLabelNames() {
  var userLabels = GmailApp.getUserLabels();
  var gmailLabelNames = [];
  for(var i in userLabels) {
    var name = userLabels[i].getName();
    gmailLabelNames.push(name);
  }//for
  return gmailLabelNames;
}//_getGmailLabelNames

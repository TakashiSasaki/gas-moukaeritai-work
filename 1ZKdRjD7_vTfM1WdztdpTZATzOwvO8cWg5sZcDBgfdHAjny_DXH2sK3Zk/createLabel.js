function createLabel() {
  var cell = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getActiveCell();
  var label_string = cell.getValue();
  Logger.log("label_string = " + label_string);
  var gmail_label = GmailApp.getUserLabelByName(label_string);
  Logger.log("getUserLabelByName : " + gmail_label);
  if(gmail_label == null) {
    Logger.log("creating label : " + label_string);
    GmailApp.createLabel(label_string);
    Logger.log("created label : " + label_string);
  } else {
    Logger.log("label already exists");
  }
}//createLabel

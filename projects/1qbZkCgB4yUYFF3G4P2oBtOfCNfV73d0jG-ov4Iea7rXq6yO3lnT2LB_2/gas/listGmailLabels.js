function enumerateGmailLabels(){
  SpreadsheetAddon.checkSheetHeader("GmailLabelInfo");
  var sheet = SpreadsheetApp.getActiveSheet();
  
  var sheet = SpreadsheetAddon.getDocumentSheet(arguments.callee.name, arguments.callee.name);  
  if(sheet === undefined) return;

  sheet.getDataRange().clear();

  var header = ["name","id","type","messageListVisibility","labelListVisibility" /*, "messagesTotal", "messagesUnread", "threadsTotal", "threadsUnread"*/];
  SpreadsheetAddon.setHeader(sheet, header);
  
  var objects = [];
  var labels = Gmail.Users.Labels.list(Session.getActiveUser().getEmail()).labels;
  for(var i in labels) {
    var label = labels[i];
    var object = {};
    object.name = label.name;
    object.id = label.id;
    object.type = label.type;
    object.messageListVisibility = label.messageListVisibility;
    object.labelListVisibility = label.labelListVisibility;
    object.messageTotal = label.messagesTotal;
    object.messageUnread = label.messagesUnread;
    object.threadsTotal = label.threadsTotal;
    object.threadsUnread = label.threadsUnread;
    objects.push(object);
  }
  
  SpreadsheetAddon.updateSheet("GmailLabelInfo", objects);
  sheet.sort(header.indexOf("name")+1);
  
  //sheet.getRange("F1").setValue("action").setNote("insert,update,delete");
  SpreadsheetAddon.trimSheet();
}
enumerateGmailLabels.title="Enumerate Gmail Labels";

function getLabels() {
  var labels = Gmail.Users.Labels.list(Session.getActiveUser().getEmail()).labels;
  var rows = [[
    "id", "labelListVisibility", "messageListVisibility", "messageTotal", "messageUnread", 
    "name", "threadsTotal", "threadsUnread", "type", "internalDate", "snippet"
  ]];
  for(var i=0; i<labels.length; ++i){
    var label = labels[i];
    row = [];
    row.push(label.id);
    row.push(label.labelListVisibility);
    row.push(label.messageListVisibility);
    row.push(label.messagesTotal);
    row.push(label.messagesUnread);
    row.push(label.name);
    row.push(label.threadsTotal);
    row.push(label.threadsUnread);
    row.push(label.type);
    rows.push(row);
  }//for
  rows.frozenRows=1;
  rows.frozenColumns=0;
  return rows;
}//getLabels

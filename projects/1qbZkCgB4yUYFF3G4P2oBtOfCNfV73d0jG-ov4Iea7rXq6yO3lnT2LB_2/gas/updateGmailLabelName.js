function updateGmailLabel() {
  var objects = getRecords(SpreadsheetApp.getActiveSheet());
  var labels = Gmail.Users.Labels.list(Session.getActiveUser().getEmail());
  for(var i in objects) {
    var object = objects[i];
    if(object.action === "update") {
      var label = Gmail.Users.Labels.get(Session.getActiveUser().getEmail(), object.id);
      try {
        Gmail.Users.Labels.update(object, Session.getActiveUser().getEmail(), object.id)
      } catch (e){
        throw new Error("failed to update label " + object.id + " " + e);
      }
    }
  }
}


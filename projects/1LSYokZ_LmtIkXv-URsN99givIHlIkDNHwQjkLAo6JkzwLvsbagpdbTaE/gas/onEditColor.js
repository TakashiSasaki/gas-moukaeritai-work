function addOnEditColorTrigger() {
  var trigger = ScriptApp.newTrigger("onEditColorTriggerHandler")
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();
}//addOnEditColorTrigger

addOnEditColorTrigger.title = "Add a trigger to color modified cell";

function onEditColorTriggerHandler(event) {
  const COLOR = "#dddd44";
  const authMode = event.authMode;
  const oldValue = event.oldValue;
  const range = event.range;
  const source = event.source;
  const triggerUid = event.triggerUid;
  const user = event.user;
  const value = event.value;
  range.setBackground(COLOR);
  range.setNote(new Date());
}//onEditColorTriggerHandler

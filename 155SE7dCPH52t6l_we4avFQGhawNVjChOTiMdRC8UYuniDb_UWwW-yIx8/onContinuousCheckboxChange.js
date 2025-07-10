function onContinuousCheckboxChange(bChecked) {
  console.log("onContinuousCheckboxChange : " + JSON.stringify(bChecked)); 
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  console.log("onContinuousCheckboxChange: ss.getName() = " + ss.getName());
  var triggers = ScriptApp.getUserTriggers(ss);
  console.log("onContinuousCheckboxChange: triggers.length = " + triggers.length);
  
  for (var i = 0; i < triggers.length; ++i) {
    var trigger = triggers[i];
    var functionName = trigger.getHandlerFunction();
    console.log("onContinuousCheckboxChange: functionName = " + functionName);
    if (functionName === "onEditTest") {
      ScriptApp.deleteTrigger(trigger);
    } //if
  } //for
  
  var sheet = ss.getActiveSheet();
  var sheetName = sheet.getName();

  if (bChecked === true) {
    console.log("onContinuousCheckboxChange: bChecked = " + bChecked);
    PropertiesService.getDocumentProperties().setProperty(
      "sheetName",
      sheetName
    );
    console.log("onContinuousCheckboxChange: sheetName = " + PropertiesService.getDocumentProperties().getProperty("sheetName"));
    var newTrigger = ScriptApp.newTrigger("onEditTest")
      .forSpreadsheet(ss)
      .onEdit()
      .create();
  } else {
    PropertiesService.getDocumentProperties().deleteProperty("sheetName");
  }
  return JSON.stringify({
    sheetName: sheetName,
    continuous: bChecked
  });
}//onContinuousCheckboxChange

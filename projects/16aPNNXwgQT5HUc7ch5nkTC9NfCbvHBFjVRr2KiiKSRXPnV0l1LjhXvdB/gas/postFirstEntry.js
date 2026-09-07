function postFirstEntry(){
  var form = FormApp.getActiveForm();
  var entries = getEntries(form);
  Logger.log(entries);
  var responseUrl = getResponseUrl(form);  
  var ui = FormApp.getUi();
  var promptResponse= ui.prompt("text to be posted");
  var firstEntry = entries[0];
  var payload = {};
  payload[firstEntry] = promptResponse.getResponseText()
  Logger.log(payload);
  UrlFetchApp.fetch(responseUrl , {
    "method" : "POST",
    "payload": payload
  });
}

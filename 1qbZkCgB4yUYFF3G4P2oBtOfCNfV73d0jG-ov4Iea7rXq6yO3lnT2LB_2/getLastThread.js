function getLastThreadsForLabelIds() {
  var range = SpreadsheetApp.getActiveRange();
  var values = range.getValues();

  var sheetName = PropertiesService.getDocumentProperties().getProperty("getLastThreadsForLabelIds");

  var button = SpreadsheetApp.getUi().alert(sheetName, SpreadsheetApp.getUi().ButtonSet.YES_NO_CANCEL);
  if(button == SpreadsheetApp.getUi().Button.CANCEL) return;
  if(button == SpreadsheetApp.getUi().Button.NO) sheetName = null;
  if(sheetName === null) {
    sheetName = (new Date()).toString();
    //sheetName = "getLastThreadsForLabelIds";
  }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if(sheet === null) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
    PropertiesService.getDocumentProperties().setProperty("getLastThreadsForLabelIds", sheetName);
  }
  
  sheet.getDataRange().clear();
  
  var objects = [];
  for(i in values){
    var labelId = values[i][0];
    var listThreadsResponse = Gmail.Users.Threads.list(Session.getActiveUser().getEmail(),{labelIds:[labelId]} );
    var threads = listThreadsResponse.threads;
    if(threads === undefined) continue;
    if(threads.length === 0) continue;
    var threadId = threads[0].id;
    var thread = Gmail.Users.Threads.get(Session.getActiveUser().getEmail(), threadId);
    var snippet = thread.snippet;
    var messages = thread.messages;
    if(messages === undefined) continue;
    var message = messages[0];
    var headers = message.payload.headers;
    for(var j in headers) {
      var header = headers[j];
      if(header.name === "From") {
        var from = header.value;
        continue;
      }
      if(header.name === "To") {
        var to = header.value;
        continue;
      }
      if(header.name === "Cc") {
        var cc = header.value;
        continue;
      }
      if(header.name === "Subject") {
        var subject = header.value;
        continue;
      }
      if(header.name === "Date") {
        var date = new Date();
        date.setTime(Date.parse(header.value));
        continue;
      }
      
    }
    var object = {
      labelId: labelId,
      from:from,
      to:to,
      cc:cc,
      subject:subject,
      date: date
    }
    objects.push(object);
  }
  SpreadsheetAddon.setHeader(sheet, ["labelId", "from", "to", "cc", "subject", "date"]);
  SpreadsheetAddon.addRecords(sheet, objects);
}

function test(){
  var msec = Date.parse("Mon, 12 Jun 2017 16:28:23 +0900");
  Logger.log(d);
}

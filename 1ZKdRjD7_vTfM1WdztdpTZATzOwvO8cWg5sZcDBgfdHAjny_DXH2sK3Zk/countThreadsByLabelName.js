function countThreadsByLabelName(){
  Logger.log("countThreadsByLabelName");
  var lock = LockService.getUserLock();
  lock.waitLock(30000);
  var range = SpreadsheetApp.getActiveRange();
  if(range.getWidth()<2) {
    Logger.log("getWidth : " + range.getWidth());
    throw "the width of active range should be more than or qeual to two.";
  }//if
  var height = range.getHeight();
  Logger.log("height : " + height );
  for(var i=1; i<=height; ++i) {
    var labelName = range.getCell(i, 1).getValue();
    Logger.log("labelName : " + labelName);
    var userLabel = GmailApp.getUserLabelByName(labelName);
    var threads = userLabel.getThreads();
    Logger.log("threads : " + threads.toString());
    range.getCell(i, range.getWidth()).setValue(threads.length);
  }//for
  lock.releaseLock();
}//countThreadByLabelName

function countThreadsByLabelName(){
  var lock = LockService.getUserLock();
  lock.waitLock(30000);
  var range = SpreadsheetApp.getActiveRange();
  if(range.getWidth()<2) {
    throw "the width of active range should be more than or qeual to two.";
  }//if
  for(var i=1; i<=range.getHeight(); ++i) {
    var labelName = range.getCell(i, 1).getValue();
    Logger.log(range.getCell(i,1).getNumberFormat());
    var userLabel = GmailApp.getUserLabelByName(labelName);
    var threads = userLabel.getThreads();
    range.getCell(i, range.getWidth()).setValue(threads.length);
  }//for
  lock.releaseLock();
}//countThreadByLabelName

function countThreadsByQueryString(){
  var lock = LockService.getUserLock();
  lock.waitLock(10000);
  var range = SpreadsheetApp.getActiveRange();
  if(range.getWidth()<2) {
    throw "the width of active range should be more than or qeual to two.";
  }//if
  for(var i=1; i<=range.getHeight(); ++i){
    var queryString = range.getCell(i,1).getValue();
    var threads = GmailApp.search(queryString);
    range.getCell(i, range.getWidth()).setValue(threads.length);
  }//for
  lock.releaseLock();
}//countThreadsByQueryString

function getLastMessageDateByQueryString(){
  var lock = LockService.getUserLock();
  lock.waitLock(30000);
  var range = SpreadsheetApp.getActiveRange();
  if(range.getWidth()<2) {
    throw "the width of active range should be more than or qeual to two.";
  }//if
  for(var i=1; i<=range.getHeight(); ++i){
    var queryString = range.getCell(i,1).getValue();
    var threads = GmailApp.search(queryString);
    if(threads.length == 0) {
      range.getCell(i, range.getWidth()).clear();
    } else {
      range.getCell(i, range.getWidth()).setValue(threads[0].getLastMessageDate());
    }//if
  }//for
  lock.releaseLock();
}//getLastMessageDateByQueryString

function deleteUserLabelsByName(){
  Logger.log("deleteUserLabelsByName");
  var lock = LockService.getUserLock();
  lock.waitLock(0);
  var range = SpreadsheetApp.getActiveRange();
  if(range.getWidth()<2) {
    Logger.log("getWidth : " + range.getWidth());
    throw "the width of active range should be more than or qeual to two.";
  }//if
  var height = range.getHeight();
  Logger.log("height : " + height );
  for(var i=1; i<=height; ++i) {
    var leftmostCell = range.getCell(i,1);
    var rightmostCell = range.getCell(i, range.getWidth());
    if(rightmostCell.isBlank()) {
      Logger.log("rightmostCell.isBlank() : true");
      continue;
    }
    var labelName = leftmostCell.getValue();
    var count = rightmostCell.getValue();
    Logger.log("labelName : " + labelName + ", count : " + count);
    var userLabel = GmailApp.getUserLabelByName(labelName);
    if(count != 0) {
      continue;
    }
    if(userLabel == null) {
      continue;
    }
    userLabel.deleteLabel();
    Logger.log("deleteLabel : " + labelName);
  }//for
  lock.releaseLock();
}//countThreadByLabelName

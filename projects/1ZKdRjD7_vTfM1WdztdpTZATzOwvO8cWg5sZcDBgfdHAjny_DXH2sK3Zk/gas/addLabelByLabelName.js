/**
 @param Each row of leftmost column contains the label to be choosen.
 @param Corresponding rightmost cell contains the label to be added.
 @return The number of processed threads will be stored in each note of rightmost cell.
 */
function addLabelByLabel() {
  Logger.log("addLabelByLabelName");
  var lock = LockService.getUserLock();
  lock.waitLock(2);
  
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getActiveSheet();
  var range = sheet.getActiveRange();
  range.clearNote();
  
  for(var row = 1; row <= range.getHeight(); ++row) {
    var leftmost_cell = range.getCell(row, 1);
    var rightmost_cell = range.getCell(row, range.getWidth());
    var leftmost_label_string = leftmost_cell.getValue();
    Logger.log(leftmost_label_string);
    var leftmost_gmail_label = GmailApp.getUserLabelByName(leftmost_label_string);
    Logger.log(leftmost_gmail_label);
    if(leftmost_gmail_label == null) {
      leftmost_cell.setNote("label does not exist")  ;
      continue;
    }//if
    var rightmost_label_string = rightmost_cell.getValue();
    var rightmost_gmail_label = GmailApp.getUserLabelByName(rightmost_label_string);
    if(rightmost_gmail_label == null) {
      rightmost_cell.setNote("label does not exist");
      continue;
    }//if
    var thread_index = 0;
    while(true){
      var threads = leftmost_gmail_label.getThreads(thread_index, 500);
      if(threads.length == 0) {
        break;
      }
      Logger.log(threads.length);
      Logger.log(rightmost_gmail_label.getName());
      rightmost_gmail_label.addToThreads(threads);
      thread_index += threads.length;
      rightmost_cell.setNote(thread_index);
    }//while
  }//for

  lock.releaseLock();
}


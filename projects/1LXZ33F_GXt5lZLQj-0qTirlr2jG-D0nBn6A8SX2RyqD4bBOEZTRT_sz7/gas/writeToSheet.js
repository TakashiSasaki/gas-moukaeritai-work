function writeToSheet(digestSeparator) {
  Assert.stringOrUndefined(digestSeparator);
  var journalSheet = openSheet(64,0);
  //var journalSheet = SpreadsheetApp.getActiveSheet()
  var journalRange = journalSheet.getDataRange();
  var journalValues = journalRange.getValues();
  if(journalValues == 0) return 0;
  
  for(var j=0; j<journalValues.length; ++j){
    if(journalValues[j][0]===""){
     continue;
    }
    var firstRowIndex = j;
    break;
  }//for
  Assert.number(firstRowIndex);
  var ssNumber = journalValues[firstRowIndex][2];
  Assert.numberInRange(ssNumber, 0, 63);
  var sheetNumber = journalValues[firstRowIndex][3];
  Assert.numberInRange(sheetNumber, 0, 63);
  
  var rangeValues = [];
  for(var i=firstRowIndex; i<journalValues.length; ++i){
    var digest = journalValues[i][0];
    if(digest === "") continue;
    if(digestSeparator === undefined) {
      var digest1 = digest;
      var digest2 = "";
    } else {
      var split = digest.split(digestSeparator);
      if(split.length === 2){
        var digest1 = split[0];
        var digest2 = split[1];
      } else if(split.length === 1) {
        var digest1 = split[0];
        var digest2 = "";
      } else {
        throw "writeToSheet: wrong digestSeparator. digestSeparator=" + digest;
      }//if
    }//if
    Assert.string(digest1);
    Assert.string(digest2);
    var writeTime = journalValues[i][1];
    Assert.number(writeTime);
    var readTime = null;
    var value = journalValues[i][4];
    var row = [digest, digest2, writeTime, readTime, value];
    journalValues[i] = [null, null, null, null, null];
    rangeValues.push(row);
  }//for
  
  var sheet = openSheet(ssNumber, sheetNumber);
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(lastRow+1, 1, rangeValues.length, rangeValues[0].length);
  range.setValues(rangeValues);
  journalRange.setValues(journalValues);
}//writeToSheet

function writeToSheetTest(){
  writeToCache("ABCDEF#GHI", "Hello world");
  writeToJournal();
  writeToSheet("#");
}//writeToSheetTest

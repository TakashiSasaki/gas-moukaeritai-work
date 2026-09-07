function updateZipFiles(e) {
  LockService.getDocumentLock().waitLock(10000);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("zipFiles");
  if(!sheet){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("zipFiles");
  }
  var zip_files = getZipFiles();
  var range  = sheet.getRange(1,1,zip_files.length, zip_files[0].length);
  range.setValues(zip_files);
  sheet.setFrozenRows(1);
  sheet.sort(5, false);
}

function getZipFilesQueryString(){
  var now = (new Date()).getTime();
  var year_ago = now - 86400*90*1000;
  var q = 'modifiedDate > "' +  (new Date(year_ago)).toISOString().substring(0,19) + '" and mimeType contains "zip"';
  //var q = "( mimeType contains 'zip' )";
  Logger.log(q);
  return q;
}

function getZipFiles(){
  var q = getZipFilesQueryString();
  var file_iterator = DriveApp.searchFiles(q);
  var files = [["id", "name", "owner", "size", "last_updated"]];
  //file_iterator.getContinuationToken();
  while(file_iterator.hasNext()){
    var file = file_iterator.next(); 
    files.push([file.getId(), file.getName(), file.getOwner(), file.getSize(), file.getLastUpdated()]);
  }
  return files;
}

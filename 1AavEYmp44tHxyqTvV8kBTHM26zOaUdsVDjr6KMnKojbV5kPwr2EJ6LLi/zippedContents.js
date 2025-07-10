function updateZippedContents(){
  LockService.getDocumentLock().waitLock(10000);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("zipFiles");
  var values = sheet.getDataRange().getValues();
  //SpreadsheetApp.getUi().alert(values);
  var zipped_contents = [["id", "name", "size", "n_files", "name0", "content0"]];
  for(var i=1; i<Math.min(values.length, 50); ++i){
    var id = values[i][0];
    //SpreadsheetApp.getUi().alert(id);
    var zipped_content = getZippedContent(id);
    //SpreadsheetApp.getUi().alert(zipped_content);
    if(zipped_content[3]===1 && zipped_content[2]<1000000 && zipped_content[4]==="export.txt") {
      zipped_contents.push(zipped_content);
    }
  }
  var notes = [[null,null,null,null,null,null]];
  for(var i=1; i<zipped_contents.length; ++i){
    var content = zipped_contents[i][5];
    if(content) {
      var first_line = content.split("\n")[0];
      notes.push([null, null, null, null, null, content]);
    } else {
      notes.push([null, null, null, null, null, null]);
    }
    zipped_contents[i][5] = first_line;
  }
  var zipped_contents_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("zippedContents");
  zipped_contents_sheet.clear();
  if(!zipped_contents_sheet){
    var zipped_contents_sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("zippedContents");
  }
  var zipped_contents_range = zipped_contents_sheet.getRange(1,1, zipped_contents.length, zipped_contents[0].length);
  zipped_contents_range.setValues(zipped_contents);
  zipped_contents_range.setNotes(notes);
  zipped_contents_range.setVerticalAlignment("top");
  zipped_contents_sheet.setFrozenRows(1);
  zipped_contents_sheet.autoResizeColumn(1);
  zipped_contents_sheet.autoResizeColumn(2);
  zipped_contents_sheet.autoResizeColumn(3);
  zipped_contents_sheet.autoResizeColumn(4);
  zipped_contents_sheet.autoResizeColumn(5);
  zipped_contents_sheet.autoResizeColumn(6);
  zipped_contents_sheet.setColumnWidth(6, Math.min(1000,zipped_contents_sheet.getColumnWidth(6)));
  for(var i=2; i<=zipped_contents.length; ++i) {
    zipped_contents_sheet.setRowHeight(i, 22);
  }
}

function getZippedContent(id){
  var json_string = CacheService.getUserCache().get(id);
  var json_string;
  if(json_string) {
    return JSON.parse(json_string);
  }
  var file = DriveApp.getFileById(id);
  var blob = file.getBlob()
  try {
    var blobs = Utilities.unzip(blob);
    var content_name = blobs[0].getName();
    var content = blobs[0].getDataAsString();
    var result = [id, file.getName(), file.getSize(), blobs.length, content_name, content];
    CacheService.getUserCache().put(id, JSON.stringify(result), 21600);
    return result;
  } catch(e) {
    var result =  [id, file.getName(), file.getSize(), null, null, null];
    CacheService.getUserCache().put(id, JSON.stringify(result), 21600);
    return result;    
  }
}

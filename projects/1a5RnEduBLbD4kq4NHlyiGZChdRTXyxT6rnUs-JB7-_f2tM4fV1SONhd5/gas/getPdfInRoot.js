function getPdfInRoot(parentId) {
  if(parentId === undefined) parentId = "ROOT";
  var x =DriveApp.searchFiles("parents in '" + parentId + "' and mimeType='application/pdf'");
  var files = [];
  while(x.hasNext()){
    var file = x.next();
    files.push(file);
  }
  return files;
}

function getPdfInRootTest(){
  var files = getPdfInRoot();
  Logger.log(files);
}
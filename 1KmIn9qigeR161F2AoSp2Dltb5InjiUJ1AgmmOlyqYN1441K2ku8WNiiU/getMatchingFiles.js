function getFileIdsByMatchingTitle(searchString, limit){
  if(searchString === undefined){
    searchString = "test";
  }
  if(limit === undefined) {
    limit = 10;
  }
  var files = DriveApp.searchFiles('title contains "' + searchString + '"');
  var values = [];
  while(files.hasNext()){
    var file = files.next();
    var parents = file.getParents();
    var parentNames = [];
    while(parents.hasNext()){
      var parent = parents.next();
      parentNames.push(parent.getName());
    }
    values.push([file.getName(), file.getId(), file.getLastUpdated().toString(), parentNames]);
    if(values.length >= limit) break;
  }
  return values;
}//getFileIdsByMatchingTitle

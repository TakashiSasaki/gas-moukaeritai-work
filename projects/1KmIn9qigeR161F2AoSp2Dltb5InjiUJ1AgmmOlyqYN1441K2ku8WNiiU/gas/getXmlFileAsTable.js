function getXmlFileAsTable(fileId) {
  var file = DriveApp.getFileById(fileId);
  var blob = file.getAs("application/xml");
  var xml = blob.getDataAsString();
  var document = XmlService.parse(xml);
  var contents = document.getAllContent();
  var rows = [];
  for(var i=0; i<contents.length; ++i){
    var content = contents[i];
    DataManipulation.expandXmlContent(content, rows);
  }
  var nMaxColumns = 0;
  for(var i=0; i<rows.length; ++i){
    nMaxColumns = Math.max(nMaxColumns, rows[i].length);
  }
  for(var i=0; i<rows.length; ++i){
    for(var j=rows[i].length; j<nMaxColumns; ++j){
      rows[i].push(null);
    }//for j
  }//for i
  return rows;
}//getXmlFileAsTable

function render(sheet) {
  if(sheet === undefined) {
     sheet = SpreadsheetApp.getActiveSheet();
  }//if
  var rows = sheet.getDataRange().getValues();
  var textLines = [];
  for(var i=0; i<rows.length; ++i){
    textLines.push(rows[i].join("\n"));
  }//for
  var text = textLines.join("\n");
  var html = marked(text);
  //html = "test";
  var date = new Date();
  var sheetName = sheet.getName();
  return JSON.stringify({
    html: html, 
    date: date,
    sheetName: sheetName});
}//reload

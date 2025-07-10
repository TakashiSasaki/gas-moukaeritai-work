/**
  @param {Spreadsheet} ss
  @return {Boolean}
*/
function spreadsheet(ss){
  if(typeof ss !== "object") return false;
  if(toString.call(ss) !== "[object JavaObject]") return false;
  if(Object.prototype.toString.call(ss) !== "[object JavaObject]") return false;
  if(typeof ss.toString !== "function") return false;
  if(ss.toString() !== "Spreadsheet") return false;
  return true;
}//getSpreadsheetTest
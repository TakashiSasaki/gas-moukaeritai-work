/**
  @param {Spreadsheet} ss
  @return {Boolean}
*/
function spreadsheet(ss){
  if(typeof ss !== "object") {
    throw "spreadsheet: ss is " + typeof ss;
  }//if
  if(toString.call(ss) !== "[object JavaObject]") {
    throw "spreadsheet: ss is " + toString.call(ss);
  }//if
  if(Object.prototype.toString.call(ss) !== "[object JavaObject]") {
    throw "spreadsheet: ss is " + Object.prototype.toString.call(ss);
  }//if
  if(typeof ss.toString !== "function") {
    throw "spreadsheet: ss does not have toString.";
  }//if
  if(ss.toString() !== "Spreadsheet") {
    throw "spreadsheet: ss.toString() did not returned Spreadsheet.";
  }//if
}//spreadsheet
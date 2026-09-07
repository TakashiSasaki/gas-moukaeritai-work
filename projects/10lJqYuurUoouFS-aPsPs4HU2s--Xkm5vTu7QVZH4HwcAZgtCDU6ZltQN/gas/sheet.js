/**
  @param {Sheet} 
  @return {Boolean}
*/
function sheet(sheet){
  if(typeof sheet !== "object") {
    throw "sheet: sheet is " + typeof sheet;
  }//if
  if(toString.call(sheet) !== "[object JavaObject]") {
    throw "sheet: sheet is " + toString.call(sheet);
  }//if
  if(Object.prototype.toString.call(sheet) !== "[object JavaObject]") {
    throw "sheet: sheet is " + Object.prototype.toString.call(sheet);
  }//if
  if(typeof sheet.toString !== "function") {
    throw "sheet: sheet does not have toString.";
  }//if
  if(sheet.toString() !== "Sheet") {
    throw "sheet: sheet.toString() did not returned Sheet.";
  }//if
}//sheet
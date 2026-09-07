function SYMBOL(x){
  if(typeof x !== "object") { 
    return toSymbol(x);
  }
  var values = [];
  for(var i in x){
    values.push(toSymbol(x[i]));
  }
  return values;
}

/**
  @param {String or Integer} stringOrCharCode
  @return {String}
*/
function toSymbol(stringOrCharCode){
  if(typeof stringOrCharCode === "string") {
    var s = toSymbolFromString(stringOrCharCode); 
    return s;
  }
  if(typeof stringOrCharCode === "number") {
    var s = toSymbolFromInteger(stringOrCharCode); 
    return s;
  }
  throw new Error("unexpected type");
}

function testToSymbol(){
  if("␀" !== toSymbol(0)) throw new Error();
  var s = toSymbol("\u0001");
  if("␁" !== s) throw new Error();
  var s = toSymbol("\u0000");
  if("␀" !== s) throw new Error();
}

function toSymbolFromString(string){
  if(typeof string !== "string") throw new Error("string is expected");
  var result = "";
  for(var i=0; i<string.length; ++i) {
    var cahrCode = string.charCodeAt(i);
    result+=toSymbolFromInteger(string.charCodeAt(i));
  }
  return result;
}

function toSymbolFromInteger(charCode){
  if(typeof charCode !== "number") throw new Error("charCode should be an integer number");
  if(charCode<=0x20) return String.fromCharCode(charCode + 0x2400);
  if(charCode===0x7f) return String.fromCharCode(0x2421);
  return String.fromCharCode(x);
}

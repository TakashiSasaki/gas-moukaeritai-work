/*
  @param {string|Array|Blob}
  @return {string} safe hex includes "CDEFGHJKNQRUWXYZruwxyz"
*/
function toSafeHex(hexOrArrayOrBlob) {
  if(isBlob(hexOrArrayOrBlob)){
    var uint8Array = toUint8Array(hexOrArrayOrBlob);
    var hexString = toHex(uint8Array);
  } else if(isArray(hexOrArrayOrBlob)) {
    var uint8Array = toUint8Array(hexOrArrayOrBlob);
    var hexString = toHex(uint8Array);
  } else if(typeof hexOrArrayOrBlob === "string"){
    var hexString= hexOrArrayOrBlob;
  } else {
    throw "unexpected type.";
  }
  //var hexString = "";
  var hexString = hexString.toLowerCase();
  var hexArray = hexString.split("");
  var safeHexArray = hexArray.map(function(x){
    switch(x) {
      case "0": return "c";
      case "1": return "d";
      case "2": return "e";
      case "3": return "f";
      case "4": return "g";
      case "5": return "h";
      case "6": return 'j';
      case "7": return "k";
      case "8": return "n";
      case "9": return "q";
      case "a": case "A": return "r";
      case "b": case "B": return "u";
      case "c": case "C": return "w";
      case "d": case "D": return "x";
      case "e": case "E": return "y";
      case "f": case "F": return "z";
    }//switch
  });
  return safeHexArray.join("");
}//toSafeHex

toSafeHex.test = function(){
  var hex = "0123456789ABCDEFabcdef";
  var safe = toSafeHex(hex);
  assertEqual(safe, "CDEFGHJKNQRUWXYZruwxyz".toLowerCase());
}//toSafeHex.test

function toSafeHexTest(){
  toSafeHex.test();
}
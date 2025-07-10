function base64CharToInt(c){
  Assert.stringLength(c, 1);
  var i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".indexOf(c);
  Assert.numberInRange(i, 0, 63);
  return i;
}//base64CharToInt

base64CharToInt.test = function(){
  for(var i=0; i<64; ++i){
    var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".slice(i,i+1);
    var j = base64CharToInt(c);
    console.log("base64CharToInt: " + c + " ," + j);
  }//for
}//base64CharToInt.test

function base64CharToIntTest(){
  var base64Chars = "";
  for(var i=0; i<64; ++i){
    var shifted = i << 2;
    if(shifted >= 128) {
      shifted -= 256;
    }
    var base64String = Utilities.base64EncodeWebSafe([shifted]);
    Logger.log("base64CharToIntTest: i=" + i + ", " + base64String);
    var base64Char = base64String.slice(0,1);
    base64Chars += base64Char;
  }//for
  Logger.log(base64Chars);
  base64CharToInt.test();
}

function base64IntToChar(i){
  Assert.numberInRange(i, 0, 63);
  var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".slice(i,i+1);
  Assert.stringLength(c, 1);
  return c;
}//base64IntToChar

base64IntToChar.test = function(){
  for(var i=0; i<64; ++i){
    var c = base64IntToChar(i);
    console.log("base64IntToChar: " + i + " ," + c);
  }//for
}//base64IntToChar.test

function base64IntToCharTest(){
  base64IntToChar.test();
}//base64IntToCharTest

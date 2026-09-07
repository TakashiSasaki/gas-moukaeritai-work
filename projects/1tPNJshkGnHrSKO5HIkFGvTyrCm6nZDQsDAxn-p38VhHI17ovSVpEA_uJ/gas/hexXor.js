

/**
 Example: xorTwoHexChars("a","d") returns "7".
 @param c1 {String} [0-9a-fA-F]
 @param c2 {String} [0-9a-fA-F]
 @return {String} c1 XOR c2
*/
function xorTwoHexChars(c1, c2){
  var xorTable = makeXorTable();
  return xorTable[c1][c2];
}

function testXorTwoHexChars(){
  var c1 = "a";
  var c2 = "F";
  var v1 = parseInt(c1, 16);
  var v2 = parseInt(c2, 16);
  var c3 = xorTwoHexChars(c1,c2);
  var v3 = parseInt(c3, 16);
  if((v1 ^ v2) !== v3) throw new Error();
}

/**
 Example: xorTwoHexStrings("ad","da") returns "77".
 @param s1 {String} [0-9a-fA-F]+
 @param s2 {String} [0-9a-fA-F]+
 @@return {String} s1 XOR s2
*/
function xorTwoHexStrings(s1, s2){
  if(s1.length != s2.length) throw ("s1 and s2 has different lengths.");
  var result = "";
  for(var i=0; i<s1.length; ++i) {
    result += xorTwoHexChars(s1[i], s2[i]);
  }
  return result;
}

function testXorTwoHexStrings(){
  var s1 = "abcdef123456";
  var s2 = "123456ABCDEF";
  var s3 = "";
  for(var i=0; i<s1.length; ++i) {
    var c1 = s1.slice(i,i+1);
    var c2 = s2.slice(i,i+1);
    var v1 = parseInt(c1,16);
    var v2 = parseInt(c2,16);
    var v3 = v1 ^ v2;
    var c3 = StringUtility.toHexString(v3).slice(1,2);
    s3 += c3;
  }
  if(s3 !== xorTwoHexStrings(s1,s2).toLowerCase()) throw new Error();
}

/**
 Example: xorHexStrings(["abc", "def", "765"]) returns "036".
 @param string_array {[String]} array of hex strings.
 @return XORed all hex strings.
*/
function xorHexStrings(string_array) {
  var temp = xorTwoHexStrings(string_array[0], string_array[0]);
  for(var i=0; i<string_array.length; ++i) {
    temp = xorTwoHexStrings(temp, string_array[i]);
  }
  return temp;
}

function testXorHexStrings(){
  var s1 = "abc";
  var s2 = "def";
  var s3 = "765";
  var s4 = xorHexStrings([s1,s2,s3]);
  if(s4 !== "036") throw new Error();
}

function test(){
  if("7" !== xorTwoHexChars("a", "d")) throw new Error();
  if("7" !== xorTwoHexStrings("a", "d")) throw new Error();
  if("77" !== xorTwoHexStrings("ad", "da")) throw new Error();
}

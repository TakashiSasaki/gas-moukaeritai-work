function toPositiveByteArray(ba){
  var a = [];
  for(var i=0; i<ba.length; ++i) {
    var b = ba[i];
    if(b<0) b+= 256;
    a.push(b);
  }
  return a;
}


function isEqualByteArray(ba1, ba2) {
  if(ba1.length != ba2.length) return false;
  for(var i=0; i<ba1.length; ++i) {
    if(ba1[i] != ba2[i]) return false;
  }
  return true;
}

function byteArrayToString(byte_array){
  return String.fromCharCode.apply(null, byte_array);
}

function byteArrayToString2(ba) {
  var s = "";
  for(var i=0; i<ba.length; ++i) {
    var b = ba[i];
    if(b<0) b+=256;
    s+= String.fromCharCode(b);
  }
  return s;
}

function stringToByteArray(string) {
  var a = [];
  for(var i=0; i<string.length; ++i) {
    a.push(string.charCodeAt(i));
  }//for
  return a;
}


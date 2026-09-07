/**
  @param {Blob} blob or something
  @return {Boolean}
*/
function blob(blob) {
  var x = Object.prototype.toString.call(blob);
  console.log("Object.prototype.toString.call(blob) : " + x);
  if(x == "[object JavaObject]"){
    var keys = Object.keys(blob);
    if(keys.indexOf("copyBlob") >= 0) return true;
  }//if
  
  if(x === "[object Object]"){
    console.log("typeof blob.copyBlob : " + typeof blob.copyBlob);
    if(typeof blob.copyBlob === "function") return true;
  }
  return false;
}//blob

blob.test = function(){
  var case1 = Utilities.newBlob("abc");
  if(!blob(case1)) throw "blob.test: false failure.";
  if(blob([1,2,3])) throw "blob.test: false success.";
}//isBlob.test

function blobTest(){
  blob.test();
}
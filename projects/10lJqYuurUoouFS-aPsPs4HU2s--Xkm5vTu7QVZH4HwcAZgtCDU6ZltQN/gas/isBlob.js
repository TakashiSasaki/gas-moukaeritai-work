global = this;
/**
  @param {Blob} blob
  @return {Assert}
*/
function isBlob(blob) {
  var x = Object.prototype.toString.call(blob);
  console.log(x);
  if(x == "[object JavaObject]") {
    hasProperty(blob, "copyBlob");
    return global;
  }//if
  console.log("constructor : " + x.constructor);
  if(x == "[object Object]") { //for v8
  　console.log(Object.keys(x));
    equal("function", typeof blob.copyBlob);
    return global;
  }//if
  throw "isBlob: not a blob. " + x;
}//isBlob

isBlob.test = function(){
  var testBlob = Utilities.newBlob("本日は晴天なり");
  var testBlob2 = testBlob.copyBlob();
  console.log("testBlob.copyBlob : " + testBlob.copyBlob);
  console.log("testBlob.getBytes : " + testBlob.getBytes);
  console.log("testBlob.getBytes.name : " + testBlob.getBytes.name);
  console.log("typeof testBlob.copyBlob : " + typeof testBlob.copyBlob);
  equal("function", typeof testBlob.copyBlob);
  console.log("Object.prototype.toString.call(testBlob2) : " + Object.prototype.toString.call(testBlob2));
  isBlob(testBlob);
}

function isBlobTest(){
  console.log("isBlob.gs/isBlobTest");
  isBlob.test();
}

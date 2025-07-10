function unionArray(array1, array2){
  var o = {};
  for(var i in array1) {
    o[array1[i]] = true;
  }
  for(var i in array2) {
    o[array2[i]] = true;
  }
  var array3 = Object.keys(o);
  return array3;
}

function testUnionArray(){
  var array1 = ["a", "b", "c"];
  var array2 = ["a", "c", "d", 5];
  var array3 = unionArray(array1, array2);
  Logger.log(array3);
}


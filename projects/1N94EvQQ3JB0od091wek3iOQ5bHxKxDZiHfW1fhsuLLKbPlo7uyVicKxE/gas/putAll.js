/**
  @param {Any[]} anyArray
  @param {String[]=} keyStringArray
  @returns {String[]} Array of key strings
*/
function putAll(anyArray, keyStringArray){
  keyStringArray = Cache.putAll(cache, anyArray, keyStringArray)
  return keyStringArray;
}

/**
  @param {String[]} keyStringArray
  @return {Any[]} Array of objects
*/
function getAll(keyStringArray){
  var anyArray = Cache.getAll(cache, keyStringArray);
  return anyArray;
}

function testPutAll(){
  var o1 = {"abc": 1, "defg": 2};
  var o2 = null;
  var o3 = 1.234;
  var keys = putAll([o1,o2,o3]);
  Logger.log(keys);
  var objects = getAll(keys);
  if(JSON.stringify([o1,o2,o3]) !== JSON.stringify(objects)) throw new Error();
}


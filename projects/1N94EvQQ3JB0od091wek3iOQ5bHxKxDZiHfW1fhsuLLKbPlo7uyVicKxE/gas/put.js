/**
  @param {Any} any
  @param {Stirng=} keyString key string
  @return {String} key string
*/
function put(any, keyString){
  keyString = Cache.put(cache, any, keyString);
  return keyString;
}

function testPut(){
  var o1 = {"abc": null, "def": 1.234};
  var key = put(o1);
  if(typeof key !== "string") throw new Error();
  var o2 = get(key);
  if(JSON.stringify(o1) !== JSON.stringify(o2)) throw new Error();
  clear(key);
}

/**
  @param {String} keyString
  @returns {Any}
*/
function get(keyString) {
  var any = Cache.get(cache, keyString)
  return any;
}


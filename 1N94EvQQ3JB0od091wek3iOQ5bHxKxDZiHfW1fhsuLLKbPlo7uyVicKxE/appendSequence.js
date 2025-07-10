
/**
  @param {String} keyString
  @param {String} stringArray
  @returns {Integer} current sequence length
*/
function appendSequence(keyString, stringArray){
  var length =Cache.appendSequence(cache, keyString, stringArray);
  return length;
}


function testAppendSequence(){
  clear("keyString1");
  putSequence("keyString1", ["a"]);
  appendSequence("keyString1", ["b", "c"]);
  if(JSON.stringify(["a","b","c"]) !== JSON.stringify(getSequence("keyString1"))) throw new Error();
}

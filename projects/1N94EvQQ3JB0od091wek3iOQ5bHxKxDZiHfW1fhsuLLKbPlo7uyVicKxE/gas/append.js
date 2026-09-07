/**
  @param {String} keyString
  @param {String} string
  @returns {Integer} current sequence length
*/
function append(keyString, string) {
  var length = Cache.append(cache, keyString, string);
  return length;
}

function testAppend__(){
  try {
    append("keyString1", "valueString1");
  } catch(e) {
    if(!e.message.match("no NextNumber")) throw new Error("unexpected exception");
  }
}

function testAppend2(){

  putSequence("keyString2", []);
  append("keyString2", "");
  append("keyString2", "abc");
  if(JSON.stringify(["","abc"]) !== JSON.stringify(getSequence("keyString2"))) throw new Error();
}

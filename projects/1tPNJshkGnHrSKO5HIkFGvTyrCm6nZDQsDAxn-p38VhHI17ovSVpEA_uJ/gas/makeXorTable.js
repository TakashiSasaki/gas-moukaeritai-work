xorTable = undefined;

/**
  Example: makeXorTable()["a"]["d"] gives "7".
  
  @return {Object} XOR table for 1-digit hex.
*/
function makeXorTable() {
  if(xorTable !== undefined) return xorTable;
  if(CacheService.getScriptCache().get("xorTable")!==null){
    return JSON.parse(CacheService.getScriptCache().get("xorTable"));
  }
  var table = [];
  var o1 = new Object();
  for(var i=0; i<16; ++i) {
    var hexchar1 = "0123456789ABCDEF"[i];
    var hexchar1small = "0123456789abcdef"[i];
    var o2 = new Object();
    for(var j=0;j<16; ++j) {
      var hexchar2 = "0123456789ABCDEF"[j];
      o2[hexchar2] = "0123456789ABCDEF"[i^j];
      var hexchar2small = "0123456789abcdef"[j];
      o2[hexchar2small] = "0123456789abcdef"[i^j];
      table.push([i,j,i^j]);
    }
    o1[hexchar1] = o2;
    o1[hexchar1small] = o2;
  }
  xorTable = o1;
  CacheService.getScriptCache().put("xorTable", JSON.stringify(xorTable));
  return o1;
}
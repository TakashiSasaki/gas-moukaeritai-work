global = this;

function testAll(){
  for(var i in global) {
    if(typeof global[i] !== "object") continue;
    for(var j in global[i]) {
      if(typeof global[i][j] != "function") continue;
      if(j.match(/^testAll$/)) continue;
      if(j.match(/__$/)) continue;
      if(!j.match(/^test/)) continue;
      Logger.log("testAll -> %s.%s", i, j);
      global[i][j]();
      Logger.log("testAll <- %s.%s", i, j);      
    }
  }
}

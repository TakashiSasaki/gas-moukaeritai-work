function testAll(){
  for(var i in global) {
    var f = global[i];
    var functionName = i;
    if(toString.call(f) !== "[object Function]") continue;
    if(f.test === undefined) continue;
    f.test();
  }
}
testAll.title="Run all tests";

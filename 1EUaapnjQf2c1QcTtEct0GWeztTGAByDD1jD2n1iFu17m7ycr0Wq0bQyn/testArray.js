function testArray() {
  var a = ["v1", "v2"];
  for(var i in a){
    Logger.log(i);
    Logger.log(typeof i);
  }
  a["x"] = 123;
  Logger.log(a);
  Logger.log(Object.keys(a));
  Logger.log(typeof Object.keys(a)[0]);
}

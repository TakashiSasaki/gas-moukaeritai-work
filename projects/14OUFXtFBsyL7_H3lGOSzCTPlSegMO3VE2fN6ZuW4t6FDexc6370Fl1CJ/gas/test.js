// The maximum length of each cached value is 102400.
function testCacheLimit_(){
  var cache = CacheService.getScriptCache();
  var value1 = "";
  for(var i=0; i<102400; ++i){
    value1 += "1";
  }//for
  var value2 = "2";
  for(var i=0; i < 100;++i){
    var value = value1 + value2;
    Logger.log("testCacheLimit: " + value.length);
    try {
      cache.put(testKey, value);
    } catch(e){
      Logger.log("testCacheLimit: failed to put. length = " + value.length);
      return;
    }//try
    Logger.log("testCacheLimit: succeeded to put. length = " + value.length);
    value2 += value2 + value2;
  }//for
}//testCacheLimit

/*
  Run all brief internal test for 'Hash' project.
  @return {void}
*/
function test(){
  Is.test();
  for(var i in this){
    if(typeof this[i] === "function") {
      if(typeof this[i]["test"] === "function"){
        this[i]["test"]();
      }//if
    }//if
  }//for
}//test

testKey = PropertiesService.getScriptProperties().getProperty("testKey");
testSalt = PropertiesService.getScriptProperties().getProperty("testSalt");
testDate = PropertiesService.getScriptProperties().getProperty("testDate");
testEmail = PropertiesService.getScriptProperties().getProperty("testEmail");
testValue = PropertiesService.getScriptProperties().getProperty("testValue");

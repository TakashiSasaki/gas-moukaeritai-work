/*
  Run all brief internal test for 'Hash' project.
  @return {void}
*/
function test(){
  for(var i in this){
    if(typeof this[i] === "function") {
      if(typeof this[i]["test"] === "function"){
        this[i]["test"]();
      }//if
    }//if
  }//for
}//test

testKey = PropertiesService.getScriptProperties().getProperty("testKey");
testValue = PropertiesService.getScriptProperties().getProperty("testValue");
testSalt = PropertiesService.getScriptProperties().getProperty("testSalt");

function getNowYear(){
  const now = new Date();
  const year = now.getYear();
  console.log("typeof year : " + typeof year);
  console.log("year = " + year);
  console.log("typeof year.toString()) : " + typeof year.toString());
  if(year < 1000) {
    return year + 1900;
  } else {
    return year;
  }
}

testDate = getNowYear().toString();

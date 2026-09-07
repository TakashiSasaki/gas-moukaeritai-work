/*
  Run all brief internal test for 'Hash' project.
  @return {void}
*/
function test(){
  for(var i in this){
    if(typeof this[i] === "function") {
      if(typeof this[i]["test"] === "function"){
        console.log("Running the test for " + i);
        this[i]["test"]();
      }//if
    }//if
  }//for
  var now = new Date();
  return [now, now.getTime()];
}//test

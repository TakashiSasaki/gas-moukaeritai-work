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
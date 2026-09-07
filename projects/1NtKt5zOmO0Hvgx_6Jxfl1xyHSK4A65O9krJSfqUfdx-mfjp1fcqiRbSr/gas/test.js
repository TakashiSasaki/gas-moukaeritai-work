/**
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
  var now = new Date();
  return [now, now.getTime()];
}//test
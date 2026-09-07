function test(){
  for(var i in this){
    if(typeof this[i] === "function") {
      if(typeof this[i]["test"] === "function"){
        console.log("Assert: running " + i);
        this[i]["test"]();
      }//if
    }//if
  }//for
  var now = new Date();
  return [now, now.getTime()];
}//test

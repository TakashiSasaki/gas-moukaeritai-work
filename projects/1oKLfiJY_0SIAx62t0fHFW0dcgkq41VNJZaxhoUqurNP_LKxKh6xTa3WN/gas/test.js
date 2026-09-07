function test(){
  for(var i in this){
    if(typeof this[i] === "function") {
      if(typeof this[i]["test"] === "function"){
        Logger.log("Running the test for " + i);
        this[i]["test"]();
      }//if
    }//if
  }//for
}//test

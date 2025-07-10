/**
  @return {string}
*/
function uniq(){
  throw "uniq: create an instance first.";
}

StringEx_.prototype.uniq = function() {
  var result = "";
  for(var i=0; i<this.string.length; ++i){
    if(result.indexOf(this.string[i])<0){
      result+=this.string[i];
    }//if
  }//for 
  return result;
}//uniq

function testUniq_(){
  Logger.log(create("aabcace").uniq());
}//testUniq

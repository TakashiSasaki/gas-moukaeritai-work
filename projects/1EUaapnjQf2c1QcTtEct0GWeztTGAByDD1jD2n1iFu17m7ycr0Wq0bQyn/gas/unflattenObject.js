function unflatten(pathValues){
  if(!(pathValues instanceof Array)) throw "unflatten: pathValues should be an array of arrays.";
  var artifact;
  for(var i in pathValues){
    var propertyPath = pathValues[i][0];
    if(!(propertyPath instanceof Array)) throw "unflatten: propertyPath should be an array of strings and numbers.";
    var propertyValue = pathValues[i][1];
    artifact = deployValue(propertyPath, propertyValue, artifact);
  }//for
  return artifact;
}//unflatten

function testUnflatten1_() {
  assertEqual({
      "i1": {
        "j1": {
          "k1": "v1",
        },
        "j2": {
          "k2": "v2"
        }
      },
      "i2": {
        "j3": {
          "k3": "v3"
        }
      }
    },
    unflatten([
      [
        ["i1", "j1", "k1"], "v1"
      ],
      [
        ["i1", "j2", "k2"], "v2"
      ],
      [
        ["i2", "j3", "k3"], "v3"
      ]
    ]) //unflatten
  ); //assertEqual
} //testUnflatten1_

function testUnflattenAll(){
  for(var i in this){
    if(typeof this[i] === "function") {
      if(this[i].name.match(/^testUnflatten.*_/)){
        Logger.log(this[i].name);
        this[i].apply({});
      }//if
    }//if
  }//for
}//testUnflattenAll

/**
  deployValue
  @param {Array<string>} path
  @param {Any} value
  @param {?Object} targetObject
  @return {Object}

  TODO: append an array if path component is number.
*/
function deployValue(pathArray, value, targetObject) {
  if(pathArray.length === 0) {
    if(targetObject !== undefined) throw "deployValue: unnecessary targetObject was given.";
    return value;
  }//if
  
  if(typeof pathArray[0] === "number") {
    if(targetObject === undefined) {
      targetObject = [];
    } else if(!(targetObject instanceof Array)){
      throw "deployValue: targetObject should be an instance of Array.";
    }//if    
    if(pathArray.length === 1) {
      if(targetObject[pathArray[0]] !== undefined) {
        throw "deployValue: overriding existing item.";
      }//if
      targetObject[pathArray[0]] = value;
      return targetObject;
    }//if
    if(targetObject[pathArray[0]] === undefined){
      targetObject[pathArray[0]] = deployValue(pathArray.slice(1), value);
      return targetObject;
    }//if
    deployValue(pathArray.slice(1), value, targetObject[pathArray[0]]);
    return targetObject;
  }//if
  
  if(typeof pathArray[0] === "string") {
    if(targetObject === undefined) {
      targetObject = {};
    } else if(targetObject instanceof Array) {
      throw "deployValue: targetObject is an instance of Array.";
    } else if(targetObject === null){
      throw "deployValue: targetObject is null.";
    } else if(typeof targetObject !== "object") {
      throw "deployValue: targetObject is not an object.";
    }//if
    if(pathArray.length === 1){
      if(targetObject[pathArray[0]] !== undefined) {
        throw "deployValue: overriding existing property.";
      }//if
      targetObject[pathArray[0]] = value;
      return targetObject;
    }//if
    if(targetObject[pathArray[0]] === undefined) {
      targetObject[pathArray[0]] = deployValue(pathArray.slice(1), value);
      return targetObject;
    }//if
    deployValue(pathArray.slice(1), value, targetObject[pathArray[0]]);
    return targetObject;
  }//if
  throw "deployValue: it should not be here";
}//deployValue

function testDeployValue1_(){
  assertEqual(deployValue(["i1", "j1", "k1"], "v1"),
  {
    "i1": {
      "j1": {
        "k1": "v1"
      }
    }
  });
}//testDeployValue1_

function testDeployValue2_(){
  var targetObject = deployValue(["i1", "j1", "k1"], "v1")
  deployValue(["i1", "j2", "k2"], "v2", targetObject);
  deployValue(["i2", "j3", "k3"], "v3", targetObject);
  assertEqual(targetObject, {
    "i1" : {
      "j1": {
        "k1": "v1"
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
  });
}//testDeployValue2_

function testDeployValue3_(){
  assertEqual(deployValue([], 1.23), 1.23);
}//testDeployValue3_

function testDeployValue4_(){
  assertEqual(deployValue([0], true), [true]);
  assertEqual(deployValue([1], true), [,true]);
  assertEqual(deployValue([2], true), [,,true]);
}//testDeployValue4_

function testDeployValueAll(){
  for(var i in this){
    if(typeof this[i] === "function") {
      if(this[i].name.match(/^testDeployValue.*_/)){
        Logger.log(this[i].name);
        this[i].apply({});
      }//if
    }//if
  }//for
}//testDeployValueAll

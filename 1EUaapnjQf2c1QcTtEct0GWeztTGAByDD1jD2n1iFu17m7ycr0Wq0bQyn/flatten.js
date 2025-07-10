/**
  flatten
*/
function flatten(any, prefix, pathValues, lookIntoArray) {
  if(prefix === undefined) prefix = [];
  if(pathValues === undefined) pathValues = [];
  if(lookIntoArray === undefined) lookIntoArray = false;

  if(any instanceof Array && any.length === 0) {
    pathValues.push([[], any]);
    return pathValues;
  }//if
  
  if(any instanceof Array && lookIntoArray === true){
    for(var i=0; i<any.length; ++i){
      var newprefix = cloneArray(prefix, i);
      flatten(any[i], newprefix, pathValues, lookIntoArray);
    }//for
    return pathValues;
  }//if
  
  if(any instanceof Array){
    pathValues.push([cloneArray(prefix), any]);
    return pathValues;
  }//if
  
  if(any === null){
    pathValues.push([cloneArray(prefix), any]);
    return pathValues;
  }//if
  
  if(typeof any === "object" && Object.keys(any).length === 0){
    pathValues.push([cloneArray(prefix), any]);
    return pathValues;
  }//if
  
  if(typeof any === "object"){
    for(var i in any) {
      var newprefix = cloneArray(prefix, i);
      flatten(any[i], newprefix, pathValues, lookIntoArray);
    }//for
    return pathValues;
  }//if

  switch(typeof any) {
    case "number":
    case "boolean":
    case "string":
      pathValues.push([cloneArray(prefix), any]);
      return pathValues;
  }//switch

  throw "flattenObject: should not be in here.";
}//flatten


function testFlatten1_(){
  var pathValues = flatten({
    "a" : "b",
    "c" : [ 1,2,3 ],
    "d" : {
      "e" : "f",
      "g" : "h"
    }
  });
  Logger.log(pathValues);
  assertEqual(pathValues, [
    [["a"], "b"],
    [["c"], [ 1,2,3 ]],
    [["d","e"], "f"],
    [["d","g"], "h"]
  ]);
}//testFlatten1_

function testFlatten2_(){
  var pathValues = flatten({
    "a" : "b",
    "c" : [ 1,2,3 ],
    "d" : {
      "e" : "f",
      "g" : "h"
    }
  }, undefined, undefined, true);
  Logger.log(pathValues);
  assertEqual(pathValues,[
    [["a"], "b"],
    [["c",0], 1],
    [["c",1], 2],
    [["c",2], 3],
    [["d","e"], "f"],
    [["d","g"], "h"]
  ]);
}//testFlatten2_

function testFlatten3_(){
  assertEqual([[[],1.23]], flatten(1.23));
  assertEqual([[[],true]], flatten(true));
  Logger.log(flatten([1,2,3]));
  var x = flatten([1,2,3]);
  assertEqual([[[],[1,2,3]]], x);
}//testFlatten3_

function testFlattenAll(){
  for(var i in this){
    if(typeof this[i] === "function") {
      if(this[i].name.match(/^testFlatten.*/)){
        Logger.log(this[i].name);
        this[i].apply({});
      }//if
    }//if
  }//for
}//testFlattenAll

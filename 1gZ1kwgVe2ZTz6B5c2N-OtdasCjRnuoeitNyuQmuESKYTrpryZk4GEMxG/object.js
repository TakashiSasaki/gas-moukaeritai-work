/**
  keep one property and remove all others from given object.
  @param {Object} object
  @param {[String]} propertyNames Only these properties will be kept.
  @returns {void}
*/
function deletePropertiesExcept(object, propertyNames) {
  for(var j in object) {
    if(propertyNames.indexOf(j) >=0 ) {
      continue;
    }
    delete object[j];
  }
  return object;
}

function testDeletePropertiesExcept(){
  var o = {
    aaa: 1,
    bbb: 2,
    ccc: 3,
    ddd: 4,
  }
  deletePropertiesExcept(o, ["bbb", "ccc"]);
  if(JSON.stringify({bbb:2, ccc:3}) !== JSON.stringify(o)) throw new Error();
}

/**
  shallow-copy enumerable properties. Values of existing properties are overwritten.
  @param {Object} srcObject
  @param {Object} dstObject
  @returns {Object} dstObject
*/
function copyShallow(srcObject, dstObject) {
  for(var j in srcObject){
    dstObject[j] = srcObject[j];
  }
  return dstObject;
}

copyShallow.test = function (){
  var srcObject = {
    aaa: 1,
    bbb: 2,
    ccc: 3
  }
  
  var dstObject = {
    aaa: 111,
    ddd: 444
  }
  
  copyShallow(srcObject, dstObject);
  if(JSON.stringify({aaa:1, ddd:444, bbb:2, ccc:3}) !== JSON.stringify(dstObject)) throw new Error();
  
}

function unionOfProperties(objects){
  if(!(objects instanceof Array)) throw "expecting an array";
  var o = {};
  for(var i in objects){
    var object = objects[i];
    if(object instanceof Array) throw "expecting non-array object";
    if(!(object instanceof Object)) throw "expecting an object";
    for(var j in objects[i]) {
      o[j] = true;
    }
  }
  return Object.keys(o);
}

unionOfProperties.test = function (){
  var o1 = {a:1,b:2};
  var o2 = {b:3,d:4};
  Logger.log(unionOfProperties([o1,o2]));
}

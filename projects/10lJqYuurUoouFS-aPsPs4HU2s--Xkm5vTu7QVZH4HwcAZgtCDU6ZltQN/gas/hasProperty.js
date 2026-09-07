global = this;
/**
  @param {Object} obj
  @param {String} propertyName
  @return {Assert}
*/
function hasProperty(obj, propertyName) {
  isObject(obj);
  isString(propertyName);
  var keys = Object.keys(obj);
  var i = keys.indexOf(propertyName);
  if(i<0) {
    throw "hasProperty: object does not have property " + propertyName;
  }//if
  return global;
}//hasProperty

/**
  `Up` represents user properties.
  @constructor
*/
function Up() {
  if(Up.userPropertyService === undefined){
    Up.userPropertyService = PropertiesService.getUserProperties();
    Assert.isObject(Up.userPropertyService).notNull(Up.userPropertyService);
  }//if
  Up.userProperties = undefined;
  var sealed = Object.seal(this);
  return sealed;
}//Up

/**
  @param {String} key
  @return {String}
*/
Up.prototype.get = function(key){
  Assert.isString(key);
  if(Up.userProperties === undefined){
    Up.userProperties = Up.userPropertyService.getProperties();
  }//if
  var value = Up.userProperties[key];
  return value;
}//Up.property.get


/**
  @param {String} key
  @param {String} value
  @return {void}
*/
Up.prototype.put = function(key, value){
  Assert.isString(key);
  Assert.isString(value);
  Up.userPropertyService.setProperty(key, value);
}//Up.property.put

function UpTest(){
  var up1 = new Up();
  up1.put("test", "hello");
  var up2 = new Up();
  Logger.log(up2.get("test"));
}//UpTest
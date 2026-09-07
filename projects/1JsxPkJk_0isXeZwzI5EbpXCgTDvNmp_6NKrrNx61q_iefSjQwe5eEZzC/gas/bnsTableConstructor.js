// BNS stands for boolean, number and string

function BnsTableConstructor(values, iKeyColumn, iFieldRow){
  if(!(this instanceof BnsTableConstructor)) throw "missing new operator";
  ExtendableTableConstructor.apply(this, arguments);
  return this;
}//BnsTableConstructor

BnsTableConstructor.prototype = Object.create(ExtendableTableConstructor.prototype);
BnsTableConstructor.prototype.constructor = BnsTableConstructor;

BnsTableConstructor.prototype.get = function(key, field){
  var value = ExtendableTableConstructor.prototype.get.apply(this, [key, field]);
  if(typeof value === "boolean" || typeof value === "number") {
    return value;
  }//if
  if(value === "") return null;
  if(value.charAt(0) === '"' || value.charAt(0) === '[' || value.charAt(0) === '{'){
    return JSON.parse(value);
  }
  return value;
}//get

BnsTableConstructor.prototype.set = function(key, field, value) {
  if(typeof value === "boolean" || typeof value === "number") {
    ExtendableTableConstructor.prototype.set.apply(this, [key, field, value]);
    return;
  }//if
  
  if(value === null) {
    ExtendableTableConstructor.prototype.set.apply(this, [key, field, ""]);
    return;
  }//if
  
  if(typeof value === "object"){
    ExtendableTableConstructor.prototype.set.apply(this, [key, field, JSON.stringify(value)]);
    return;    
  }
  if(typeof value !== "string") {
    throw 'typeof value === "' + typeof value + '"';
  }//if
  
  if(value === "") {
    ExtendableTableConstructor.prototype.set.apply(this, [key, field, JSON.stringify(value)]);
    return;
  }//if
  
  if(value.charAt(0) === '"' || value.charAt(0) === '[' || value.charAt(0) === '{'){
    ExtendableTableConstructor.prototype.set.apply(this, [key, field, JSON.stringify(value)]);
    return;
  }//if
  
  ExtendableTableConstructor.prototype.set.apply(this, [key, field, value]);
}//set

function testBnsTableConstructor(){
  var bnsTable = new BnsTableConstructor();
  bnsTable.addNewKey("k1");
  bnsTable.addNewField("f1");
  bnsTable.set("k1", "f1", null);
  if(null !== bnsTable.get("k1", "f1")) throw "expecting null";
  bnsTable.set("k1", "f1", {});
  if(typeof bnsTable.get("k1", "f1") !== "object") throw "expecting object";
  bnsTable.set("k1", "f1", "");
  if(bnsTable.get("k1", "f1") !== "") throw "expecting empty string";
  bnsTable.set("k1", "f1", "abc");
  if(bnsTable.get("k1", "f1") !== "abc") throw "expecting empty string";
  bnsTable.set("k1", "f1", 123.456);
  if(bnsTable.get("k1", "f1") !== 123.456) throw "expecting 123.456 as a number";
  bnsTable.set("k1", "f1", false);
  if(bnsTable.get("k1", "f1") !== false) throw "expecting boolean false";
  bnsTable.set("k1", "f1", true);
  if(bnsTable.get("k1", "f1") !== true) throw "expecting boolean true";
  bnsTable.set("k1", "f1", '"');
  if(bnsTable.get("k1", "f1") !== '"') throw "expecting double quote";
  bnsTable.set("k1", "f1", '"TRUE"');
  if(bnsTable.get("k1", "f1") !== '"TRUE"') throw "expecting double quoted TRUE";
  bnsTable.set("k1", "f1", '"FALSE"');
  if(bnsTable.get("k1", "f1") !== '"FALSE"') throw "expecting double quoted FALSE";
}//testBnsTableConstructor

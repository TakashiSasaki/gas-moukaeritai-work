// NS stands for number and string
// TRUE, True, true, FALSE, False, false strings are all boolean.

function NsTableConstructor(values, iKeyColumn, iFieldRow){
  if(!(this instanceof NsTableConstructor)) throw "missing new operator";
  BnsTableConstructor.apply(this, arguments);
  return this;
}//NssTableConstructor

NsTableConstructor.prototype = Object.create(BnsTableConstructor.prototype);
NsTableConstructor.prototype.constructor = NsTableConstructor;

NsTableConstructor.prototype.set = function(key, field, value){
  if(typeof value === "boolean"){
    BnsTableConstructor.prototype.set.apply(this, [key, field, value ? "TRUE" : "FALSE" ]);
    return;
  }
  BnsTableConstructor.prototype.set.apply(this, [key, field, value]);
}//set

NsTableConstructor.prototype.get = function(key, field) {
  var value = BnsTableConstructor.prototype.get.apply(this, [key, field]);
  console.log(value);
  switch(value) {
    case 'TRUE': return true;
    case 'True' : return true;
    case 'true' : return true;
    case 'FALSE': return false;
    case 'False' : return false;
    case 'false' : return false;
    default: return value;
  }//switch
}//get

function testNsTableConstructor(){
  var nsTable = new NsTableConstructor();
  nsTable.addNewKey("k1");
  nsTable.addNewField("f1");
  nsTable.set("k1", "f1", null);
  if(null !== nsTable.get("k1", "f1")) throw "expecting null";
  nsTable.set("k1", "f1", {});
  if(typeof nsTable.get("k1", "f1") !== "object") throw "expecting object";
  nsTable.set("k1", "f1", "");
  if(nsTable.get("k1", "f1") !== "") throw "expecting empty string";
  nsTable.set("k1", "f1", "abc");
  if(nsTable.get("k1", "f1") !== "abc") throw "expecting empty string";
  nsTable.set("k1", "f1", 123.456);
  if(nsTable.get("k1", "f1") !== 123.456) throw "expecting 123.456 as a number";
  nsTable.set("k1", "f1", false);
  if(nsTable.get("k1", "f1") !== false) throw "expecting boolean false";
  nsTable.set("k1", "f1", true);
  if(nsTable.get("k1", "f1") !== true) throw "expecting boolean true";  
  nsTable.set("k1", "f1", "TRUE");
  var x = nsTable.get("k1", "f1"); 
  if(x !== true) throw "expecting boolean TRUE";  
  nsTable.set("k1", "f1", "FALSE");
  var x = nsTable.get("k1", "f1"); 
  if(x !== false) throw "expecting boolean FALSE";  
  nsTable.set("k1", "f1", '"hello"');
  if(nsTable.get("k1", "f1") !== true) throw "expecting double quoted hello";  
}

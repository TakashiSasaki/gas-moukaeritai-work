function JsonTableConstructor(values, iKeyColumn, iFieldRow) {
  if(!(this instanceof JsonTableConstructor)) throw "missing new operator";
  ExtendableTableConstructor.apply(this, arguments);
  return this;
}//JsonTableConstructor

JsonTableConstructor.prototype = Object.create(ExtendableTableConstructor.prototype);
JsonTableConstructor.prototype.constructor = JsonTableConstructor;



JsonTableConstructor.prototype.getAsObject = function(){
  var result = {};
  for(var i=this.iFieldRow+1; i<this.values.length; ++i){
    var key = this.values[i][this.iKeyColumn];
    for(var j=this.iKeyColumn+1; j<this.values[this.iFieldRow].length; ++j){
      var field = this.values[this.iFieldRow][j];
      var value = this.values[i][j];
      var v = undefined;
      if(typeof value === "boolean" || typeof value === "number") {
        v = value;
      } else {
        try {
          var parsed = JSON.parse(value);
          if(parsed !== undefined) {
            v = parsed;
          }
        } catch(e){
          if(value === "") {
            v = null;
          } else {
            v = value;
          }
        }//try
      }//if
      if(v === undefined) throw "invalid value type";
      if(result[key] === undefined) result[key] = {};
      result[key][field] = v;
    }//for j
  }//for i
  return result;
}//function getAsObject

JsonTableConstructor.prototype.setByObject = function(o){
  for(var key in o){
    if(this.keys[key] === undefined){;
      this.addNewKey(key);
    }//if
  }//for key
  for(var key in o){
    for(var field in o[key]){
      if(this.fields[field] === undefined) this.addNewField(field);
      console.log("value = " + o[key][field]);
      this.set(key,field,o[key][field]);
    }// for field
  }//for key
}//function setByObject


function testJsonTableConstructor(){
  var typedTable = new JsonTableConstructor();
  typedTable.setByObject({"key-a": {"field-b":1}});
  typedTable.setByObject({"key-c": {"field-d":"value-2"}});
  typedTable.setByObject({"key-c": {"field-b":"value-1"}});
  console.log(JSON.stringify(typedTable.getValues()));
  console.log(typedTable.getAsObject());
}//testJsonTableConstructor

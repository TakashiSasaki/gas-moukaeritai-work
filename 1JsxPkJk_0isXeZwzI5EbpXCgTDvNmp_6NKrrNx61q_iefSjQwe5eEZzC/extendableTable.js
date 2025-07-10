function ExtendableTableConstructor(values, iKeyColumn, iFieldRow) {
  if(!(this instanceof NamedTableConstructor)) throw "missing new operator";
  NamedTableConstructor.apply(this, arguments);
  return this;
}//ExtendableTableConstructor

ExtendableTableConstructor.prototype = Object.create(NamedTableConstructor.prototype);
ExtendableTableConstructor.prototype.constructor = ExtendableTableConstructor;

ExtendableTableConstructor.prototype.addNewKey = function(key){
  console.log("insert new key '" + key + "'");
  this.keys[key] = this.values.length;
  var newRow = [];
  for(var i=0; i<this.values[this.iFieldRow].length; ++i){
    newRow.push(null);
  }//for i
  newRow[this.iKeyColumn] = key;
  this.values.push(newRow);
}//addNewKey

ExtendableTableConstructor.prototype.addNewField = function(field){
  console.log("insert new field '" + field + "'");
  this.fields[field] = this.values[this.iFieldRow].length;
  this.values.forEach(function(row){
    row.push(null);
  });
  this.values[this.iFieldRow][this.fields[field]] = field;
}//addNewField

function testExtendableTableConstructor(){
  var extendableTable = new ExtendableTableConstructor();
  extendableTable.checkIntegrity();
  extendableTable.addNewKey("newKey1");
  extendableTable.addNewField("newField1");
  extendableTable.checkIntegrity();
}//testExtendableTableConstructor

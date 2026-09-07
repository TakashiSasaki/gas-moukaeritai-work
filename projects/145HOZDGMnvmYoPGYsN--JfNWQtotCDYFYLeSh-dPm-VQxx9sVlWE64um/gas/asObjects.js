/**
  @return {Object[]}
*/
function asObjects(){
  throw "asObjects: use createTable to create an instance of Table.";
}//asObjects

Table_.prototype.asObjects = function(){
  this.toObjects();
  return this.objects;
}//asObjects

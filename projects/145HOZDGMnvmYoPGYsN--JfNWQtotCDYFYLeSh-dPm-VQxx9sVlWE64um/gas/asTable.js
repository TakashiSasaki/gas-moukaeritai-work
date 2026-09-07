/**
  @return {Object[][]}
*/
function asTable(){
  throw "asTable: use createTable to create an instance of Table.";
}//asTable

Table_.prototype.asTable = function(){
  this.toTable();
  return this.table;
}//asTable

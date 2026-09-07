/**
  @return {Table}
*/
function toTable(){
  throw "toTable: use createTable to create an instance of Table.";
}//toTable

Table_.prototype.toTable = function(){
  if(this.table[0].length === 0) {
    var propertyNames = {};
    for(var i=0; i<this.objects.length; ++i){
      for(var j=0; j<Object.keys(this.objects[i]).length; ++j){
        propertyNames[Object.keys(this.objects[i])[j]] = 1;
      }//for j
    }//for i
    this.table[0] = Object.keys(propertyNames);
  }//if

  for(var i=0; i<this.objects.length; ++i){
    var row = [];
    for(var j=0; j<this.table[0].length; ++j){
      row.push(this.objects[i][this.table[0][j]]);
    }//for j
    this.table.push(row);
  }//for i
  this.objects = [];
  return this;
}//toTable
/**
  @return {Table}
*/
function toObjects(){
  throw "toObjects: to be called with an instance of Table.";
}//toObjects

Table_.prototype.toObjects = function(){
  for(var i=1; i<this.table.length; ++i){
    var o = {};
    for(var j=0; j<this.table[0].length; ++j){
      o[this.table[0][j]] = this.table[i][j];
    }//for j
    this.objects.push(o);
  }//for i
  this.table = [this.table[0]];
  return this;
}//toObjects


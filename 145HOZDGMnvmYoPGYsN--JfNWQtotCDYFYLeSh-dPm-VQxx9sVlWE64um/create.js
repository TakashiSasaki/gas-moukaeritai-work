/**
  @param {String[]} header row of the table
  @return {Table} a new instance of Table
*/
function create(header){
  return new Table_(header);
}//create
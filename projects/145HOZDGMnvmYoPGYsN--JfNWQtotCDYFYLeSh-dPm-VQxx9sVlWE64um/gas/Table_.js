function Table_(header) {
  this.objects = [];
  if(header !== undefined){
    this.table = [header];
  } else {
    this.table = [[]];
  }//if
  return this;
}//Table_

function testTable(){
  var table = createTable();
  table.append({"a": 1, "b": 2});
  table.append({"a": 3, "c": 4});
  Logger.log(table.asTable());
  Logger.log([][2]);
  var a = [];
  a.push(undefined);
  Logger.log(a);
  Logger.log([undefined]);
  Logger.log(table.asTable());
  Logger.log(table.asObjects());
  
  var t = createTable(["a","b"]);
  t.append({"a":1});
  t.append({"b":2});
  Logger.log(t.asTable());
}//testTable

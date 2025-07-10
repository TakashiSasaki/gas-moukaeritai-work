function jsonTableToObjects(table) {
  var columns = [];
  for(var i in table[0]){
    var column = JSON.parse(table[0][i]);
    if(typeof column !== "string") throw "The top row should have JSON strings as property names.";
    columns.push(column);
  }//for
  
  var objects = [];
  for(var j=1; j<table.length; ++j){
    var object = {};
    for(k in table[j]){
      if(table[j][k] === null) continue;
      if(table[j][k] === "") continue;
      var value = JSON.parse(table[j][k]);
      object[columns[k]] = value;
    }//for
    objects.push(object);
  }//for
  return objects;
}//jsonTableToObjects

function testJsonTableToObjects(){
  var table = [
    [ '"k1"', '"k2"', '"k3"' ],
    [ '"v1"',       , 1.23   ],
    [ ""    , '"v2"', '"v3"' ]
  ];
  var objects = jsonTableToObjects(table);
  Logger.log(objects);
  var table2 = objectsToJsonTable(objects);
  Logger.log(table2);
  assertEqual(objects, 
    [
      {"k1" : "v1", "k3" : 1.23},
      {"k2" : "v2", "k3" : "v3"}
    ]
  );
}//jsonTableToObjects


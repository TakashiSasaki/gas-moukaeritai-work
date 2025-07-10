/**
  Convert an array of objects into a table of JSON.
  Type of each cell in the resulting table is string
  and it can be parsed as JSON.
  The first row is an array of keys among all given objects.
  A value for missing key is stored as null in the table.
  Null value itself is stored as "null" string.
  Therefore objectsToJsonTable is invertible conversion.

  input
  [{ "k1": "s1", "k2": [n1, n2]}, { "k2" : "v2", "k3": "s3" }]
  
  output
  [ ["\"k1\""      "\"k2\""        "\"k3\""  ],
    ["\"s1\"",     "[n1, n2]",     "null"    ],
    [null    ,     "\"s2\""  ,     "\"s3\""  ] ]

  @param {Array} array of objects
  @return {Rows} array of array of JSON
*/
function objectsToJsonTable(objects){
  var columnTypes = {};

  objects.forEach(function(object){
    Object.keys(object).forEach(function(columnName){
      columnTypes[columnName] = typeof object[columnName];
    });
  });

  var rows = [[]];
  for(var i in columnTypes){
    rows[0].push(JSON.stringify(i));
  }
  
  objects.forEach(function(object){
    var row = [];
    Object.keys(columnTypes).forEach(function(columnName){
      var value = object[columnName];
      if(value === undefined) {
        row.push(null);
      } else {
        row.push(JSON.stringify(value));
      }
    });
    rows.push(row);
  });

  return rows;
}//objectsToJsonTable

function testObjectsToJsonTable(){
  var objects = [
    {"k1":"v1"},
    {"k2":2}
  ];
  var rows = objectsToJsonTable(objects);
  Logger.log(rows);
  Logger.log({"a": "b"}["c"]);
  var a = [,];
  a.push(undefined);
  Logger.log(a);
  var objects2 = jsonTableToObjects(rows);
  assertEqual(objects, objects2);
}//testObjectsToJsonTable

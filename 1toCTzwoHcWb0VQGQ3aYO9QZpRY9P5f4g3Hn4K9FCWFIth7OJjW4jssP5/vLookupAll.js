/**
  Like VLOOKUP function except that it returns all rows.
  
  @param key {Number or String} the value to find in the first column
  @param arrayNM {Array} array of N rows and M columns
  @param index {Number} the column index to get values in given array
  @return {Array} Horizontal array of found values
*/
function vLookupAll(key, arrayNM, index) {
  if(arguments.length===0) {
    testVLookupAll_();
    return;
  }
  var results = [];
  for(var i=0; i<arrayNM.length; ++i){
    if(arrayNM[i][0]===key){
      results.push(arrayNM[i][index-1]);
    }
  }
  return results;
}


function testVLookupAll_(){
  var result = vLookupAll(123, [[100,"one"], [123,"two"], [124, "three"], [123, "four"]], 2);
  Logger.log(result);
}

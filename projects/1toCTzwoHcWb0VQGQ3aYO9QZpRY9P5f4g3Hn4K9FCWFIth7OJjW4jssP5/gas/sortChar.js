/*
  sortChar returns sorted char sequence of given string.
  It takes an multidimensional array of strings as well.
  
  @param {String} string_or_array
  @return sorted chars
*/
function sortChars(string_or_array){
  if(arguments.length===0) {
    testSortChars_();
    return;
  }
  
  if(toString.call(string_or_array)==="[object String]"){
    var array = string_or_array.split("");
    var sorted = array.sort(function(a,b){
      return a.charCodeAt(0) - b.charCodeAt(0);
    });
    var joined = sorted.join("");
    return joined;
  }
  
  if(toString.call(string_or_array)==="[object Array]"){
    var results = [];
    for(var i=0; i<string_or_array.length; ++i){
      var result = sortChars(string_or_array[i]);
      results.push(result);
    }
    return results;
  }
}

function testSortChars_(){
  Logger.log(sortChars("dyta"));
  Logger.log(sortChars("01234560"));
  Logger.log(sortChars([["oiafjdsjaf"], [";ijigjiraoi"]]));
}

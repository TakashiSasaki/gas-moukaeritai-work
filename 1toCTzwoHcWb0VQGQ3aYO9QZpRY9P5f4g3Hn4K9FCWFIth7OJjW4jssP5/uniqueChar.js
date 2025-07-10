/*
  uniqueChars removes duplicate characters in given string.
  It accepts a multidimensional array of strings as well.
  
  @param {String} string_or_array
  @return {String}
*/
function uniqueChars(string_or_array){
  if(arguments.length === 0){
    testUniqueChars_();
    return;
  }
  if(toString.call(string_or_array)==="[object String]"){
    var chars = string_or_array;
    var result="";
    for(var i=0; i<chars.length; ++i){
      if(result.indexOf(chars[i])<0){
        result+=chars[i];
      }//if
    }//for
    return result;
  }
  if(toString.call(string_or_array)==="[object Array]"){
    var results = [];
    for(var i=0; i<string_or_array.length; ++i){
      var result = uniqueChars(string_or_array[i]);
      results.push(result);
    }
    return results;
  }
}

function testUniqueChars_(){
  Logger.log(toString.call("abc"));
  Logger.log(uniqueChars("aabcace"));
  Logger.log(uniqueChars(["aabcace"]));
  Logger.log(uniqueChars([["aa"], ["bb"]]));
}

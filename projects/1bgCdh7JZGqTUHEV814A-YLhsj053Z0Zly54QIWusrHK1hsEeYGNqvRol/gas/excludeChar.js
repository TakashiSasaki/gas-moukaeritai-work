/*
  removes chars from given string.
  It also takes arrays of strings.
  
  @param {String} string
  @param {String} charsToBeRemoved
  @return {String}
*/

function removeChars(string, charsToBeRemoved) {
  var result = "";
  for(var i=0; i<string.length; ++i){
    var c = string[i];
    if(charsToBeRemoved.indexOf(c) <0){
      result += c;
    }
  }
  return result;
}

function removeCharsForRange(values){
  var results = [];
  for(var i in values){
    var result = removeChars(values[i][0], values[i][1]);
    results.push([result]);
  }
  return results;
}

function testExcludeChars_(){
  var x = removeCharsForRange([["abc","a"], ["def","e"]]);
  if(JSON.stringify(x) !== JSON.stringify([["bc"],["df"]])) throw new Error();
}

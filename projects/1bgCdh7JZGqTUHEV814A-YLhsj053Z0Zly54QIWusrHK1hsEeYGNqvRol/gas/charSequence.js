/*
  charSequence returns a char sequence between two codepoints.
  
  @param {Number} begin_codepoint a number, 1*N array or 2*N array.
  @param {Number} end_codepoinat.
  @return {String} a char sequence or 1*N array of chars.
*/
function charSequence(begin_codepoint_or_array, end_codepoint_or_undefined){
  if(arguments.length===0) {
    testCharSequence_();
    return;
  }
  
  if(toString.call(begin_codepoint_or_array).match("Array") && end_codepoint_or_undefined===undefined){
    if(begin_codepoint_or_array.length===1){
      var result = [];
      for(var i=0; i<begin_codepoint_or_array[0].length; ++i){
        result.push(String.fromCharCode(begin_codepoint_or_array[0][i]));
      }
      return [result];
    }
    if(begin_codepoint_or_array.length === 2) {
      var result = [];
      for(var i=0; i<begin_codepoint_or_array[0].length; ++i){
        result.push(charSequence(begin_codepoint_or_array[0][i], begin_codepoint_or_array[1][i]));
      }
      return [result];
    }
  }
  if(toString.call(begin_codepoint_or_array).match("Number")){
    if(end_codepoint_or_undefined === undefined || end_codepoint_or_undefined===""){
      return charSequence_(begin_codepoint_or_array, begin_codepoint_or_array);
    } else if (toString.call(end_codepoint_or_undefined).match("Number")){
      return charSequence_(begin_codepoint_or_array, end_codepoint_or_undefined);
    }
  }
}

function charSequence_(begin_codepoint, end_codepoint){
  var result = "";
  for(var i=begin_codepoint; i<=end_codepoint; ++i){
    result+=String.fromCharCode(i);
  }
  return result;
}

function testCharSequence_(){
  Logger.log(charSequence(48, 48+10));
  Logger.log(charSequence(49));
  Logger.log(charSequence([[48, 49, 50]]));
  Logger.log(charSequence([[48, 49, 50], [49, 50, 51]]));
}
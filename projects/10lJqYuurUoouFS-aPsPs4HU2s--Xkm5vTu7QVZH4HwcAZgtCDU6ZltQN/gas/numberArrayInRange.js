/**
  @param {Array} number_array
  @param {Number} min
  @param {Number} max
  @return {void}
*/
function numberArrayInRange(number_array, min, max){
  if(numberArray(number_array)) throw "numberArrayInRange: numberArrayInRange should be an array of numbers.";
  if(typeof min !== "number") throw "numberArrayInRange: min is mandatory.";
  if(typeof max !== "number") throw "numberArrayInRange: max is mandatory.";
  if(min > max) throw "numberArrayInRange: min and max is opposite";
  for(var i=0; i<numberArray.length; ++i){
     if(numberArray[i] > max) throw "numberArrayInRange: Out of range. Too large.";
     if(numberArray[i] < min) throw "numberArrayInRange: Out of range. Too small.";
  }//for
}//numberArrayInRange

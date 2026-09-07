/**
  @param {Array} array
  @param {Number} bitmask
  @return {void}
*/
function numberArrayZeroBits(array, bitmask){
  for(var i=0; i<array.length; ++i){
     if((array[i] & bitmask) !== 0) throw "Found a bit which is set to 1.";
  }//for
}//numberArrayZeroBits


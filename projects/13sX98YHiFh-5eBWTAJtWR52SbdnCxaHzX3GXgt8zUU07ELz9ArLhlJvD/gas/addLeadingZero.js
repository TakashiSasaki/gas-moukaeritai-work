/**
  @param {Number} num integer
  @param {Number} totalLength
*/
function addLeadingZero(num, totalLength) {
  Assert.isInteger(num);
  Assert.isInteger(totalLength).isNumberPositive(totalLength);
  var integerString = num.toFixed(0);
  var result = padHead(integerString, "0", totalLength);
  return result;
}//addLeadingZero

addLeadingZero.test = function(){
  var result = addLeadingZero(5, 4);
  Assert.equalStrings(result, "0005");
}

function addLeadingZeroTest(){
  addLeadingZero.test();
}

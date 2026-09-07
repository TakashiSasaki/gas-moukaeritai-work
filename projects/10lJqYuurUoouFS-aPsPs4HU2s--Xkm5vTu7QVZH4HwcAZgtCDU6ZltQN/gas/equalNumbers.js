/**
  @param {Number} num1
  @param {Number} num2
  @return {void}
*/
function equalNumbers(num1, num2){
  if(typeof num1 !== "number") throw "equalNumber: num1 is not a number.";
  if(typeof num2 !== "number") throw "equalNumber: num2 is not a number.";
  if(num1 !== num2) throw "num1 and num2 is not equal.";
}//equalNumbers

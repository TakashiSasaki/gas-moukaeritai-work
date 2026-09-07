/**
  @param {Date} d a Date object
  @return {String} two digit month
*/
function getMm(d) {
  if(d === undefined) {
    d = new Date();
  }//if
  Assert.dateObject(d);
  var month = d.getMonth() + 1;
  Assert.isNumberInRange(month, 1, 12);
  var result = addLeadingZero(month, 2);
  Assert.isString(result).length(result, 2);
  return result;  
}

getMm.test = function(){
  var mm = getMm();
  Logger.log("getMm.test: " + mm);
}//getMm.test

function getMmTest(){
  getMm.test();
}//getMmTest
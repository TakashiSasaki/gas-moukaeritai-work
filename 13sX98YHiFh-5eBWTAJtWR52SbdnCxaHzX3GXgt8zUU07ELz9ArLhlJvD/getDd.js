/**
  @param {Date} d a Date object
  @return {String} two digit date in a month
*/
function getDd(d) {
  if(d === undefined) {
    d = new Date();
  }//if
  Assert.dateObject(d);
  var day = d.getDate();
  Assert.isNumberInRange(day, 1, 31);
  var result = addLeadingZero(day, 2);
  Assert.isString(result).length(result, 2);
  return result;
}

getDd.test = function(){
  var dd = getDd();
  Logger.log("getDd: " + dd);
}

function getDdTest(){
  getDd.test();
}
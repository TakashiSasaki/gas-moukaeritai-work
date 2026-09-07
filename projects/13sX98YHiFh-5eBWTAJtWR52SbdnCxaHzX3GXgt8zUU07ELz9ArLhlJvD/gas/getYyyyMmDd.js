/**
  @param {Date} d a Date object
  @param {String} sep a separator
  @return {String} date in YYMMDD format
*/
function getYyyyMmDd(sep, dateObject) {
  if(sep === undefined) {
    sep = "";
  }//if
  Assert.isString(sep);
  var a = getYyyyMmDdArray(dateObject);
  var result = a.join(sep);
  return result;
}//getYyyyMmDd

getYyyyMmDd.test = function(){
  Logger.log("getYyyyMmDd.test: " + getYyyyMmDd());
  Logger.log("getYyyyMmDd.test: " + getYyyyMmDd("-"));
  Logger.log("getYyyyMmDd.test: " + getYyyyMmDd("-", new Date()));
}

function getYyyyMmDdTest(){
  getYyyyMmDd.test();
}

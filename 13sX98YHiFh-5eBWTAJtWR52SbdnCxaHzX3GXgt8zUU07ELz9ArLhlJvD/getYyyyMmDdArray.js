/**
  @param {Date} d a Date object
  @result {Array} array of three strings
*/
function getYyyyMmDdArray(d) {
  if(d === undefined) {
     d = new Date();
  }//if
  Assert.dateObject(d);
  var yyyy = getYyyy(d);
  var mm = getMm(d);
  var dd = getDd(d);
  var result = [yyyy , mm, dd];
  return result;
}//getYyyyMmDdArray

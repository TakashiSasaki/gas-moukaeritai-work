/**
  @param {Date} d a Date object
  @return {String} four digit year string
*/
function getYyyy(d) {
  if(d === undefined) {
    d = new Date();
  }//if
  Assert.dateObject(d);
  var year = d.getYear();
  Assert.isNumberInRange(year, 1900, 2199);
  var yearString = year.toFixed(0);
  Assert.isString(yearString).length(yearString, 4);
  return yearString;
}//getYyyy

getYyyy.test = function(){
  var yyyy = getYyyy();
  Assert.equalStrings(yyyy, "2019");
}//getYyyy.test

function getYyyyTest(){
  var now = new Date();
  Assert.dateObject(now);
  getYyyy.test();
}//getYyyy

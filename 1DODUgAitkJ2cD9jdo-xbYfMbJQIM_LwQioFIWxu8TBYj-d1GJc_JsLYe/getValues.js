/*
  @param {string} salt
  @param {string} date
  @return {object} pairs of key and expiration time for all items put with the salt and date.
*/
function getValues(salt, date) {
  if(salt === undefined) "getValues: salt is mandatory.";
  if(date === undefined) "getValues: date is mandatory.";
  var keys = getKeys(salt, date);
  var all = {};
  for(var i in Object.keys(keys)){
    var key = Object.keys(keys)[i];
    var value = get(salt, date, key);
    if(value !== null) {
      all[key] = value;
    }//if
  }//for
  return all;
}//getValues

getValues.test = function(){
  put.test();
  var all = getValues(testSalt, testDate);
  Logger.log("getValues.test: " + JSON.stringify(all));
}//getValues.test

function getValuesTest(){
  getValues.test();
}//getValuesTest
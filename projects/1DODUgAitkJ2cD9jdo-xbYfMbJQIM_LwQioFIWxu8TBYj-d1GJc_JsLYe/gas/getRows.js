/*
  @param {string} salt
  @param {string} date
  @return {object} pairs of key and expiration time.
*/
function getRows(salt, date){
  if(salt === undefined) throw "getRows: salt is mandatory.";
  if(date === undefined) throw "getRows: date is mandatory.";
  var keys = getKeys(salt, date);
  var rows = [];
  var keyArray = Object.keys(keys);
  for(var i in keyArray){
    var key = keyArray[i];
    var timeString = keys[key];
    var expiresAt = parseInt(timeString);
    var value = get(salt, date, key);
    var row = [key, expiresAt, value];
    rows.push(row);
  }//for
  return rows;
}//getRows

getRows.test = function(){
  put.test();
  var rows = getRows(testSalt, testDate);
  Logger.log("getRows.test: " + JSON.stringify(rows));
}//getRows.test

function getRowsTest(){
  getRows.test();
}//getRowsTest

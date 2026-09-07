/**
  @param {String} dateString
  @return {Boolean}
*/
function dateString(dateString){
  if(typeof dateString !== "string") return false;
  var dateRegEx = /^\d{4}([-](\d{2})([-]\d{2})?)?$/;
  //Logger.log("dateString: " + date.match(dateRegEx));
  return dateString.match(dateRegEx) !== null;  
}//dateString

dateString.test = function(){
  if(!dateString("2019")) throw "dateString.test: failed for '2019'.";
  if(dateString("201")) throw "dateString.test: succeeded for '201'";
  if(dateString("20199")) throw "dateString.test: succeeded for '20199'";
  if(dateString("2019-")) throw "dateString.test: succeeded for '2019-'";
  if(!dateString("2019-11")) throw "dateString.test: failed for '2019-11'";
  if(!dateString("2019-11-14")) throw "dateString.test: failed for '2019-11-14'";
}//dateString.test

function dateStringTest(){
  dateString.test();
}//dateStringTest
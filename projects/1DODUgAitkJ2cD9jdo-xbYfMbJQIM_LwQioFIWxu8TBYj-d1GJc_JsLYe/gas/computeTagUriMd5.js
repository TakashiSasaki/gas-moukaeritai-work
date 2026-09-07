/**
  @param {string} salt
  @param {string} date
  @return {string} saltEmailHash
*/
function computeTagUriMd5(salt, date) {
  if(salt === undefined) throw "computeTagUriMd5: salt is undefined.";
  if(date === undefined) throw "computeTagUriMd5: date is undefined.";
  var email = Session.getEffectiveUser().getEmail();
  var tagUriMd5 = WebClipboardWriter.computeTagUriMd5(salt, email, date);
  return tagUriMd5;
}//computeTagUriMd5

computeTagUriMd5.test = function(){
  var tagUriMd5 = computeTagUriMd5(testSalt, testDate);
  Logger.log("Web Clipboard Reader/computeTagUriMd5.test: " + tagUriMd5);
}//computeTagUriMd5.test

function computeTagUriMd5Test(){
  computeTagUriMd5.test();
}//computeTagUriMd5Test

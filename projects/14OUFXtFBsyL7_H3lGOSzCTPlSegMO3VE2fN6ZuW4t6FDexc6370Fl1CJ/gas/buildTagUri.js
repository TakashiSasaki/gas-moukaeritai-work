/**
  @param {String} salt
  @param {String} email
  @param {String} date
  @return {String} Tag URI
*/
function buildTagUri(salt, email, date){
  console.log("buildTagUri.gs/buildTaguri");
  Assert.isString(salt);
  //if(typeof salt !== "string") throw "buildTagUri: salt is mandatory.";
  if(!Is.email(email)) {
    throw "buildTagUri: email is malformed :" + email;
  }//if
  if(!(Is.dateString(date))) {
    throw "buildTagUri: date is malformed : " + date;
  }//if
  var tagUri = "tag:" + email + "," + date + ":" + salt;
  return tagUri;
}//buildTagUri

buildTagUri.test = function(){
  var tagUri = buildTagUri(testSalt, testEmail, testDate);
  Logger.log("buildTagUri.test: " + tagUri);
}//buildTagUri.test

function buildTagUriTest(){
  buildTagUri.test();
}//buildTagUriTest

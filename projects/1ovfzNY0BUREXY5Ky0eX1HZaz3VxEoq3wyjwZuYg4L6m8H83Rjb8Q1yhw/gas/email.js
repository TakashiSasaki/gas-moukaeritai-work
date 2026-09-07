/**
  @param {String} Email string
  @return {Boolean}
*/
function email(emailString){
  if(typeof emailString !== "string") return false;
  var emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ 
  return emailString.match(emailRegEx) !== null;
}//email

email.test = function(){
  if(!email("a@example.com")) throw "Is.email.test: failed for 'a@example.com'.";
  if(email("a..b@example.com")) throw "Is.email.test: failed for 'a..b@example.com'.";
  if(email("a@example.")) throw "Is.email.test: failed for 'a@example'.";
  if(email("a.@example.com")) throw "Is.email.test: failed for 'a.@example.com'.";
  if(email(".a@example.com")) throw "Is.email.test: failed for '.a@example.com'.";
}//email.test

function emailTest(){
  email.test();
}//emailTest

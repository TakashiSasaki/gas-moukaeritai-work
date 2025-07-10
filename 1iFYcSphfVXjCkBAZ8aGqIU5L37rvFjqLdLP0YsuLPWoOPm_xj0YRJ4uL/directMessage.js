function sendDirectMessage(message){
  var screen_name = getScreenName();
  var service = getTwitterService();
  var http_response = service.fetch("https://api.twitter.com/1.1/direct_messages/new.json?screen_name=" + screen_name + "&text=" + encodeURIComponent(message), {"method":"POST", "muteHttpExceptions": true});
  var content_text = http_response.getContentText();
  return content_text;  
}

function testSendDirectMessage(){
  sendDirectMessage("hehehe hahaha");
}

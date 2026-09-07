function unblock(userId){
  var service = getTwitterService();
  var http_response = service.fetch("https://api.twitter.com/1.1/blocks/destroy.json?user_id=" + userId, {"method":"POST"});
  var content_text = http_response.getContentText();
  setBlockState(userId, false);
  return content_text;
}


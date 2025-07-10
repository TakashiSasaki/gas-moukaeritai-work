function mute(userId){
  var service = getTwitterService();
  var http_response = service.fetch("https://api.twitter.com/1.1/mutes/users/create.json?user_id=" + userId, {"method": "POST"});
  var content_text = http_response.getContentText();
  setMuteState(userId, true);
  return content_text;
}

function fetchMutedUsers(){
  var service = getTwitterService();
  var mutedUsers = CacheService.getUserCache().get("mutedUsers");
  if(mutedUsers === null) {
    mutedUsers = [];
  } else {
    mutedUsers = JSON.parse(mutedUsers);
    if(!(mutedUsers instanceof Array)){
      mutedUsers = [];
    }
  }
  var nextCursor = CacheService.getUserCache().get("nextCursor");
  CacheService.getUserCache().remove("nextCursor");
  if(nextCursor === null) {
    var http_response = service.fetch("https://api.twitter.com/1.1/mutes/users/list.json?include_entities=false&skip_status=true");
  } else {
    var http_response = service.fetch("https://api.twitter.com/1.1/mutes/users/list.json?include_entities=false&skip_status=true&cursor=" + nextCursor);  
  }
  var contentText = http_response.getContentText();
  var o = JSON.parse(contentText);
  for(var i in o.users) {
    //r user = [o.users[i].id_str, o.users[i].screen_name, o.users[i].description];
    var userId = o.users[i].id_str;
    var screenName = o.users[i].screen_name;
    var description = o.users[i].description;
    setMuteState(userId, true);
    mutedUsers.push(userId);
  }
  CacheService.getUserCache().put("mutedUsers", JSON.stringify(mutedUsers), 21600);
  if(mutedUsers.length > 500) return;
  if(o.next_cursor_str) {
    CacheService.getUserCache().put("nextCursor", o.next_cursor_str, 30);
    fetchMutedUsers();
  }
}

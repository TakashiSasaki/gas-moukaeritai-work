function getBlockedUsers(){
  var blockedUsers = CacheService.getUserCache().get("blockedUsers");
  if(typeof blockedUsers === typeof "") {
    blockedUsers = JSON.parse(blockedUsers);
    if(blockedUsers instanceof Array) {
      if(blockedUsers.length > 0) {
        return blockedUsers;
      }
    }
  }
  fetchBlockedUsers();
  fetchMutedUsers();
  return JSON.parse(CacheService.getUserCache().get("blockedUsers"));
}

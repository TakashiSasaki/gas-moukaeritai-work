function removeBlockedUser(blockedUser){
  var blockedUsers = CacheService.getUserCache().get("blockedUsers");
  if(blockedUsers === null) return;
  var blockedUsers = JSON.parse(blockedUsers);
  blockedUsers.some(function(v,i){
    //blockedUsersには重複した要素がないのでまぁこれでいい。
    if(v === blockedUser) blockedUsers.splice(i,1);
  });
  CacheService.getUserCache().put("blockedUsers", JSON.stringify(blockedUsers), 21600);
}

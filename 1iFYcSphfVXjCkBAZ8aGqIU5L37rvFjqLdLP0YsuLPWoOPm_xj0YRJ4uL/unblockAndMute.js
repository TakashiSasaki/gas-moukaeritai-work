function unblockAndMute() {
  var blockedUsers = getBlockedUsers();
  Logger.log(blockedUsers.length);
  var blockedUser = blockedUsers[blockedUsers.length-1];
  var blockedUser = blockedUsers[0];
  CacheService.getUserCache().put("unblockAndMute", JSON.stringify([new Date(), Session.getActiveUser().getEmail(), Session.getEffectiveUser().getEmail(), Session.getTemporaryActiveUserKey()]));
  Logger.log(blockedUser);
  var muteState = getMuteState(blockedUser);
  var blockState = getBlockState(blockedUser);
  if(muteState !== true && blockState === true) {
    mute(blockedUser);
    unblock(blockedUser);
  }
  removeBlockedUser(blockedUser);
}

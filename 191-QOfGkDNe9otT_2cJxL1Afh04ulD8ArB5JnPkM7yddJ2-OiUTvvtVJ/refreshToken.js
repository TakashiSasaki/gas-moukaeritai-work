function getRefreshToken() {
  return get_("refresh_token");
}

function setRefreshToken(refresh_token) {
  if(!refresh_token) throw "invalid refresh token";
  return set_("refresh_token", refresh_token);
}


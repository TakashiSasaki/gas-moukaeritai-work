function setTokenType_(token_type) {
  if(!token_type) throw "invalid token type";
  return set_("token_type", token_type);
}

function getTokenType(){
  return get_("token_type");
}


function setTimestamp_(){
  return set_("timestampe", new Date());
}

function getTimestamp_(){
  var timestamp_string =  get_("timestampe");
  var timestamp = new Date(timestamp_string);
  return timestamp;
}

function setExpiresIn_(expires_in){
  return set_("expires_in", expires_in);
}

function getExpiresIn_(){
  return get_("expires_in");
}

function getExpiresAt(){
  var timestamp = getTimestamp_();
  //Logger.log(timestamp);
  var expires_in = getExpiresIn_();
  //Logger.log(expires_in);
  var expires_at_ms = timestamp.getTime() + expires_in * 1000;
  var expires_at = new Date(expires_at_ms);
  //Logger.log(expiration_time);
  return expires_at;
}
function setClientSecret(client_secret){
  if(!client_secret) throw "invalid client secret";
  return set_("client_secret", client_secret);
}

function getClientSecret_(){
  return get_("client_secret");
}


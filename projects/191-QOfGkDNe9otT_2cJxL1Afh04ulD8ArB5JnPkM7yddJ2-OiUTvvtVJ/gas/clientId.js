function setClientId(client_id) {
  if(!client_id) throw "invalid client id";
  return set_("client_id", client_id);
}

function getClientId_() {
  return get_("client_id");
}


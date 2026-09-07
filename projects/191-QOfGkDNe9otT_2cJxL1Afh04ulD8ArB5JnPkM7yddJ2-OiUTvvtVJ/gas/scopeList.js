function setScopeList(scope_list) {
  if(!scope_list) throw "invalid scope list";
  return set_("scope_list", scope_list);
}

function getScopeList_(){
  var scope_list = get_("scope_list");
  if(typeof scope_list == "string") return scope_list;
  return scope_list.join(" ");
}


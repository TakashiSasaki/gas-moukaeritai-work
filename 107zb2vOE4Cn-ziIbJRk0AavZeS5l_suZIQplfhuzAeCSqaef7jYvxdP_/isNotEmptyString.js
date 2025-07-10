function isNonemptyString(x) {
  if(x instanceof String || typeof x === "string"){
    if(x.length > 0) return true;
  }
  return false;
}




const pepper = PropertiesService.getScriptProperties().getProperty("pepper");

/**
 * get
 */
function get(key, namespace) {
  const md5String = calculateMD5(namespace + pepper + key);
  return CacheService.getScriptCache().get(md5String);
}

function getAll(keys, namespace){
  const md5Strings = keys.map(key => calculateMD5(namespace + pepper + key));
  return CacheService.getScriptCache().getAll(md5Strings);
}

function put(key, value, namespace) {
  const md5String = calculateMD5(namespace + pepper + key);
  return CacheService.getScriptCache().put(md5String, value);
}

function putAll(o, namespace){
  const oo = {};
  const keys = Object.keys(o);
  console.log(keys);
  keys.forEach(key=>{
    const md5String = calculateMD5(namespace + pepper + key);
    oo[md5String] = o[key];
    console.log(oo);
  });
  return CacheService.getScriptCache().putAll(oo);
}

function remove(key, namespace){
  const md5String = calculateMD5(namespace + pepper + key);
  return CacheService.getScriptCache().remove(md5String);
}

function removeAll(keys, namespace){
  const md5Strings = keys.map(key=>calculateMD5(namespace + pepper + key));
  CacheService.getScriptCache().removeAll(md5Strings);
}

function getBaseUrl(){  
  const url = ScriptApp.getService().getUrl();
  const m = url.match(/^http.*\/(dev|exec)/);
  return m[0];
}

function getPostEndpointPath(clearNamespace){
  return calculateMD5(pepper + getGetEndpointPath(clearNamespace) + pepper);
}

function getGetEndpointPath(clearNamespace){
  return calculateMD5(pepper + clearNamespace + pepper);
}

cache = CacheService.getScriptCache();

/**
  @param {String} keyString
  @returns {void}
*/
function clear(keyString) {
  Cache.clear(cache, keyString);
}

/**
  @param {String} keyString
  @param {Integer=} beginIndex 0-origin
  @param {Integer=} endIndex 0-origin
  @returns {String[]}
*/
function getSequence(keyString, beginIndex, endIndex){
  var stringArray = Cache.getSequence(cache, keyString, beginIndex, endIndex);
  return stringArray;
}

/**
  @param {String} keyString
  @param {String[]} a list of strings
  @return {void}
*/
function putSequence(keyString, stringArray){
  Cache.putSequence(cache, keyString, stringArray);
}

/**
  @param {Object} object
  @param {String} keyPropertyName
  @return {void}
*/
function stash(object, keyPropertyName) {
  Cache.stash(cache, object, keyPropertyName)
}

/**
  @param {Object} object
  @return {void}
*/
function unstash(object){
  Cache.unstash(cache, object);
}


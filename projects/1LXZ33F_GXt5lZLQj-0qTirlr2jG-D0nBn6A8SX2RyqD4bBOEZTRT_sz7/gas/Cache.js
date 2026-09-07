"use strict";
/**
  @constructor
  @return {Cache}
*/
function Cache() {
  if(!Cache.userCache) {
    Cache.userCache = CacheService.getUserCache();
  }
  return Object.seal(this);
}//Cache

/**
  @param {String} k
  @param {String} v
  @return {void}
*/
Cache.prototype.write = function(k, v){
  Assert.isString(k).isString(v);
  var dirty = new Dirty();
  dirty.setDirty(k, (new Date()).getTime());
  Cache.userCache.put(k, v, 21600);
}//Cache.prototype.put

Cache.prototype.put = function(k,v){
  Assert.isString(k).isString(v);
  Cache.userCache.put(k, v, 21600);
}//Cache.prototype.put

Cache.prototype.get = function(k){
  Assert.isString(k);
  var v = Cache.userCache.get(k);
  Assert.isDefined(k);
  return v;
}//Cache.prototype.get

/**
  @param {String[]} keyArray
  @return {void}
*/
Cache.prototype.getAll = function(keyArray){
  Assert.isArray(keyArray);
  var o = Cache.userCache.getAll(keyArray);
  Assert.isObject(o);
  return o
}//Cache.prototype.getAll

/**
  @param {String[]} keyArray
  @return {void}
*/
Cache.prototype.removeAll = function(keyArray){
  Assert.isArray(keyArray);
  Cache.userCache.removeAll(keyArray);
}//Cache.prototype.removeAll

Cache.test = function(){
  var cache = new Cache();
  cache.write("ABC", "Hello");
}//Cache.test

function CacheTest(){
  Cache.test();
}//CacheTest
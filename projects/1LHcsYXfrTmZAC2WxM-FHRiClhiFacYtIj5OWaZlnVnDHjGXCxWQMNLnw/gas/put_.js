
function put_(md5,page,key,value){
  if(typeof value != "string") throw new Error("value is " + typeof value);
  const cache = CacheService.getUserCache();
  if(typeof page != "number") {
    const cacheKey = md5 + key;
    cache.put(cacheKey, value, 21600);
    console.log(cacheKey + ": " + value);
  } else {
    const cacheKey = md5 + page + "-" + key;
    cache.put(cacheKey, value, 21600);
    console.log(cacheKey + ": " + value);
  }
}


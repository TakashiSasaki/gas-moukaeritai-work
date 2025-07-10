function getReposJsonString(username){
  if(username === undefined) {
    username = getUserName();
  }
  var cached = CacheService.getUserCache().get("getReposJsonString" + username);
  if(cached) return cached;
  var url = "https://api.github.com/users/" + username + "/repos?sort=updated";
  var blob = GasOAuthLibrary.fetchBlob(url);
  var jsonString = blob.getDataAsString();
  try {
    CacheService.getUserCache().put("getReposJsonString" + username, jsonString);
  } catch(e) {
  }
  return jsonString;
}

function getReposNames(username){
  var cacheKey = "getReposNames/" + username;
  var cached = CacheService.getUserCache().get(cacheKey);
  if(cached) return JSON.parse(cached);
  var jsonString = getReposJsonString(username);
  var jsonObject = JSON.parse(jsonString);
  var reposNames = [];
  for(var i in jsonObject) {
    reposNames.push(jsonObject[i].name);
  }
  CacheService.getUserCache().put(cacheKey, JSON.stringify(reposNames), 3600);
  Logger.log(reposNames);
  return reposNames;
}

function getRecentRepoName(username){
  var repoNames = getReposNames(username);
  var recentRepoName = repoNames[0];
  Logger.log(recentRepoName);
  return recentRepoName;
}

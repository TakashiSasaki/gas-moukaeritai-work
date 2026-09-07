function getBranchesJsonString(owner,repo){
  if(owner === undefined) {
    owner = getUserName();
  }
  if(repo === undefined) {
    repo = getRecentRepoName();
  }
  var url = "https://api.github.com/repos/" + owner + "/" + repo + "/branches";
  var cachedJsonString = CacheService.getUserCache().get(url);
  if(cachedJsonString) return cachedJsonString;
  var blob = GasOAuthLibrary.fetchBlob(url);
  var jsonString = blob.getDataAsString();
  CacheService.getUserCache().put(url, jsonString);
  Logger.log(jsonString);
  return jsonString;
}

function getBranchesNames(owner,repo){
  var cacheKey = "getBranchesNames" + "/" + owner + "/" + repo;
  var cachedString = CacheService.getUserCache().get(cacheKey);
  if(cachedString) return JSON.parse(cachedString);
  var jsonString = getBranchesJsonString(owner,repo);
  var jsonObject = JSON.parse(jsonString);
  var branchesNames = [];
  for(var i in jsonObject) {
    branchesNames.push(jsonObject[i].name);
  }
  CacheService.getUserCache().put(cacheKey, JSON.stringify(branchesNames));
  return branchesNames;
}

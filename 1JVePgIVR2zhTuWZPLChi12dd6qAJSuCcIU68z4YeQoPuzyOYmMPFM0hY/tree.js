function getTreeJsonString(owner, repo, treeSha) {
  if(owner === undefined) {
    owner = getUserName();
  }
  if(repo === undefined) {
    repo = getRecentRepoName();
  }
  if(treeSha === undefined) {
    treeSha = getTreeSha();
  }
  var url = "https://api.github.com/repos/" + owner + "/" + repo + "/git/trees/" + treeSha;
  var cachedJsonString = CacheService.getUserCache().get(url);
  if(cachedJsonString) return cachedJsonString;
  var blob = GasOAuthLibrary.fetchBlob(url);
  var jsonString = blob.getDataAsString();
  try {
    CacheService.getUserCache().put(url, jsonString);
  } catch(e){}
  return jsonString;
}

function getPaths(owner, repo, treeSha){
  var cacheKey = "getPaths/" + owner + "/" + repo + "/" + treeSha;
  var cachedJsonString = CacheService.getUserCache().get(cacheKey);
  var jsonString = getTreeJsonString(owner, repo, treeSha);
  var jsonObject = JSON.parse(jsonString);
  var paths = [];
  var tree = jsonObject.tree;
  for(var i in tree) {
    paths.push(tree[i].path);
  }
  CacheService.getUserCache().put(cacheKey, JSON.stringify(paths));
  return paths;
}

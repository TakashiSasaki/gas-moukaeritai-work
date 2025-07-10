
function getBranchJsonString(owner, repo, branch) {
  if(owner === undefined) {
    owner = getUserName();
  }
  if(repo === undefined) {
    repo = getRecentRepoName();
  }
  if(branch === undefined) {
    branch = "master";
  }
  var cacheKey = "getBranchJsonString/" + owner + "/" + repo + "/" + branch;
  var cachedString = CacheService.getUserCache().get(cacheKey);
  if(cachedString) return cachedString;
  var url = "https://api.github.com/repos/" + owner + "/" + repo + "/branches/" + branch;
  var blob = GasOAuthLibrary.fetchBlob(url);
  var jsonString = blob.getDataAsString();
  CacheService.getUserCache().put(cacheKey, jsonString);
  Logger.log(jsonString);
  return jsonString;
}

function getTreeSha(owner, repo, branch){
  var jsonString = getBranchJsonString(owner, repo, branch);
  var jsonObject = JSON.parse(jsonString);
  var treeSha = jsonObject.commit.commit.tree.sha;
  return treeSha;
}

function getCommitSha(owner, repo, branch) {
  var jsonString = getBranchJsonString(owner, repo, branch);
  var jsonObject = JSON.parse(jsonString);
  var commitSha = jsonObject.commit.sha;
  Logger.log("getCommitSha: " + commitSha);
  return commitSha;
}

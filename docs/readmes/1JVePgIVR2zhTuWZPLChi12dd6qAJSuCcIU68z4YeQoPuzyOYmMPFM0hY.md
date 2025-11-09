# Github Repository Summary

## Overview

The "Github Repository Summary" project is a Google Apps Script web application designed to interact with the GitHub API. It provides a user-friendly interface for users to authorize their GitHub account and then retrieve and display various information about their GitHub repositories, including details about repositories themselves, branches, commit SHAs, tree SHAs, and file paths within a repository. The application utilizes the `GasOAuthLibrary` for secure OAuth 2.0 authentication with GitHub and employs `CacheService` to cache API responses, enhancing performance and reducing redundant API calls.

## Functionality

The project offers a wide range of features for exploring and summarizing GitHub repository data:

### Core Features

-   **GitHub OAuth 2.0 Authorization:** Integrates with the `GasOAuthLibrary` to handle the OAuth 2.0 authorization flow, allowing users to grant the application access to their GitHub data.
-   **Repository Information Retrieval:**
    -   `getReposJsonString(username)`: Fetches a JSON string containing a list of repositories for a given GitHub username.
    -   `getReposNames(username)`: Extracts and returns a list of repository names from the fetched JSON data.
    -   `getRecentRepoName(username)`: Returns the name of the most recently updated repository.
-   **Branch Information Retrieval:**
    -   `getBranchesJsonString(owner, repo)`: Fetches a JSON string containing a list of branches for a specified repository.
    -   `getBranchesNames(owner, repo)`: Extracts and returns a list of branch names from the fetched JSON data.
-   **Commit and Tree Information:**
    -   `getCommitSha(owner, repo, branch)`: Retrieves the SHA of the latest commit on a specified branch.
    -   `getTreeSha(owner, repo, branch)`: Retrieves the SHA of the tree associated with the latest commit on a specified branch.
    -   `getTreeJsonString(owner, repo, treeSha)`: Fetches a JSON string representing the file tree for a given tree SHA.
    -   `getPaths(owner, repo, treeSha)`: Extracts and returns a list of file paths from the fetched tree JSON data.
-   **User and Feed Information:**
    -   `getFeedsJsonString()`: Fetches a JSON string containing GitHub feed information.
    -   `getUserName()`: Extracts the current authenticated user's GitHub username from the feed information.
-   **Caching:** Utilizes `CacheService` to cache responses from GitHub API calls, reducing the number of requests and improving application responsiveness.
-   **Web Interface (`doGet`):** Serves an HTML-based user interface (`index.html`) that allows users to input owner, repository, and branch details, and then trigger various API calls to retrieve and display GitHub data.

### Code Examples

#### `コード.js` (Main Code File)

```javascript
GasOAuthLibrary.setAuthorizationEndpoint("https://github.com/login/oauth/authorize");
GasOAuthLibrary.setClientId(PropertiesService.getScriptProperties().getProperty("GithubClientId"));
GasOAuthLibrary.setClientSecret(PropertiesService.getScriptProperties().getProperty("GithubClientSecret"));
GasOAuthLibrary.setCallbackFunctionName("callback2");
GasOAuthLibrary.setScopeList("repo");
GasOAuthLibrary.setTokenEndpoint("https://github.com/login/oauth/access_token");

function doGet() {
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  var htmlOutput = htmlTemplate.evaluate().setTitle("Github Repository Summary");
  return htmlOutput;
}

function callback2(e){
  Logger.log(e);
  return GasOAuthLibrary.callback(e);
}
```

#### `repos.js`

```javascript
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
```

#### `branches.js`

```javascript
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
```

#### `tree.js`

```javascript
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
```

## Permissions

The `appsscript.json` file specifies a dependency on the `GasOAuthLibrary` and configures the project as a web application that executes as the user accessing it and is accessible by anyone.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "libraries": [{
      "userSymbol": "GasOAuthLibrary",
      "libraryId": "191-QOfGkDNe9otT_2cJxL1Afh04ulD8ArB5JnPkM7yddJ2-OiUTvvtVJ",
      "version": "31",
      "developmentMode": true
    }]
  },
  "webapp": {
    "access": "ANYONE",
    "executeAs": "USER_ACCESSING"
  },
  "exceptionLogging": "STACKDRIVER"
}
```

## Deployments

The project has multiple deployments, with the HEAD deployment being:

-   **ID (HEAD):** `AKfycbynkdJ6-Vs7nv5zInNGOe-gFU3T2JHgAzoIg8XPt9cI`
    -   **URL:** `https://script.google.com/macros/s/AKfycbynkdJ6-Vs7nv5zInNGOe-gFU3T2JHgAzoIg8XPt9cI/exec`
-   **ID (Version 1 - web app meta-version):** `AKfycbwHjMPqB1FrhaEgbXUSolRteEISWTzcqhtHe02hKhb88fFqRUiB`
    -   **URL:** `https://script.google.com/macros/s/AKfycbwHjMPqB1FrhaEgbXUSolRteEISWTzcqhtHe02hKhb88fFqRUiB/exec`

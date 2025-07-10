function fetchGlitchProjects() {
  var glitchProjects = [];
  var glitchLoginName = userProperties.getProperty("glitchLoginName");
  if(glitchLoginName === null) return;
  var httpResponse = UrlFetchApp.fetch("https://api.glitch.com/v1/users/by/login/projects?limit=100&login=" + glitchLoginName);
  while(true) {
    var jsonString = httpResponse.getContentText();
    var json = JSON.parse(jsonString);  
    console.log(Object.keys(json));
    console.log("limit = " + json.limit);
    console.log("orderKey = " + json.orderKey);
    console.log("orderDirection = " + json.orderDirection);
    console.log("lastOrderValue = " + json.lastOrderValue);
    console.log("hasMore = " + json.hasMore);
    console.log("nextPage = " + json.nextPage);
    for(var i in json.items){
      glitchProjects.push(json.items[i]);
    }
    if(typeof json.nextPage !== "string") break;
    httpResponse = UrlFetchApp.fetch("https://api.glitch.com" + json.nextPage);
  }
  console.log("# of fetched projects = " + glitchProjects.length);
  console.log(Object.keys(glitchProjects[0]));
}


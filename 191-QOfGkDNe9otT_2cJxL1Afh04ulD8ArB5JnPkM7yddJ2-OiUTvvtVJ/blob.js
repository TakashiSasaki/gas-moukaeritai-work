function fetchBlob(url, options) {
  if(options === undefined) {
    options = {};
  }
  if(!options["headers"]) {
    options["headers"] = {}
  }
  options["headers"]["Authorization"] = "Bearer " + getAccessToken();
  Logger.log("access token = " + getAccessToken());
  var httpResponse = UrlFetchApp.fetch(url, options);
  var blob = httpResponse.getBlob();
  return blob;
}

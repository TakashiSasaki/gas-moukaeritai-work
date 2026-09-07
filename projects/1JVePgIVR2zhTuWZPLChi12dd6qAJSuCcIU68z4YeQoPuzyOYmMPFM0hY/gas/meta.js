function getMeta(){
  var url = "https://api.github.com/meta";
  var blob = GasOAuthLibrary.fetchBlob(url);
  var contentText = blob.getDataAsString();
  Logger.log(contentText);
  return contentText;
}

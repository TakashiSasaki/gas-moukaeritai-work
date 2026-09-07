function doGet(e) {
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  htmlTemplate.css = fetchCss();
  htmlTemplate.html = fetchHtml();
  var htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("Cache Clipboard");
  return htmlOutput;
}

function fetchCss(){
  var css = CacheService.getScriptCache().get("css");
  if(typeof css === "string") return css;
  css = UrlFetchApp.fetch("http://jsrun.it/TakashiSasaki/KOph/css", {validateHttpsCertificates:false}).getContentText();
  CacheService.getScriptCache().put("css", css, 60);
  return css;
}

function fetchHtml(){
  var html = CacheService.getScriptCache().get("html");
  if(typeof html === "string") return html;
  html = UrlFetchApp.fetch("http://jsrun.it/TakashiSasaki/KOph/html", {validateHttpsCertificates:false}).getContentText();
  CacheService.getScriptCache().put("html", html, 60);
  return html;
}

function test(){
  CacheHelper.put("abc", {a:"b", c:123.456});
  Logger.log(CacheHelper.get("abc"));
}


function deleteClipboard(clipboardName){
  PropertiesService.getUserProperties().deleteProperty(clipboardName);
  return getClipboards();
}

function computeClipboardId(clipboardName){
  var email = Session.getEffectiveUser().getEmail();
  var userSalt = getUserSalt();
  var md5Bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, userSalt + email + clipboardName);
  var md5String = Utilities.base64Encode(md5Bytes);
  return md5String;
}

function getUserSalt(){
  var userSalt = PropertiesService.getUserProperties().getProperty("userSalt");
  if(typeof userSalt === "string") return userSalt;
  userSalt = ""+ Math.random() + "/" + Math.random();
  PropertiesService.getUserProperties().setProperty("userSalt", userSalt);
  return userSalt;
}

function getClipboards(){
  var clipboards = [];
  var userProperties = PropertiesService.getUserProperties().getProperties();
  for(var i in userProperties) {
    if(i === "userSalt") continue;
    var clipboard = {};
    clipboard.name = i;
    clipboard.content = null;
    clipboard.description = userProperties[i];
    clipboard.id = computeClipboardId(i);
    clipboards.push(clipboard);
  }
  return clipboards;
}

function addClipboard(clipboardName, description){
  PropertiesService.getUserProperties().setProperty(clipboardName, description);
  return getClipboards();
}
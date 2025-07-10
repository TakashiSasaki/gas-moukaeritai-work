function createAuthorizationUrl(){
  var CLIENT_ID = PropertiesService.getScriptProperties().getProperty("CLIENT_ID");
  var ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
  var SCOPE = "https://www.googleapis.com/auth/script.projects";
  var USERCALLBACK_EXEC = "https://script.google.com/macros/s/AKfycbwQJNC35zwtEUGqnoQRwNQX-ALYtMHOQMw7Hz0BGFOIgyF1H4t3/usercallback";
  var USERCALLBACK_DEV = "https://script.google.com/macros/s/AKfycbydTvvCh6BhKQWPX5XYU0baBLb5BOuhDaSIvirVjsC1/usercallback";
  var STATE = ScriptApp.newStateToken().withMethod("getToken").createToken();
  //var url = endpointUrl + "?client_id=" + CLIENT_ID + "&response_type=code&scope=" + SCOPE + "&access_type=offline&redirect_uri=urn:ietf:wg:oauth:2.0:oob";
  var url = ENDPOINT;
  url += "?client_id=" + CLIENT_ID;
  url += "&response_type=code";
  url += "&access_type=offline";
  url += "&prompt=consent";
  url += "&scope=" + SCOPE;
  url += "&redirect_uri=" + USERCALLBACK_DEV;
  url += "&state=" + STATE;
  return url;
}//createAuthorizationUrl

function doGet(e) {
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  htmlTemplate.authorizationUrl = createAuthorizationUrl();
  if(SpreadsheetApp.getActiveSpreadsheet() !== null){
    htmlTemplate.activeSpreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  } else {
    htmlTemplate.activeSpreadsheetId = "";
  }
  var htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("Google Apps Script Project Browser");
  return htmlOutput;
}//doGet

function getToken(e){
  //return ContentService.createTextOutput(JSON.stringify(e));
  //curl -d client_id=[４のクライアントID] 
  //-d client_secret=[４のクライアントシークレット] 
  //-d redirect_uri=[４のリダイレクトURI] 
  //-d grant_type=authorization_code 
  //-d code=[６の認証コード] 
  //
  var CLIENT_ID = PropertiesService.getScriptProperties().getProperty("CLIENT_ID");
  var CLIENT_SECRET = PropertiesService.getScriptProperties().getProperty("CLIENT_SECRET");
  var USERCALLBACK_EXEC = "https://script.google.com/macros/s/AKfycbwQJNC35zwtEUGqnoQRwNQX-ALYtMHOQMw7Hz0BGFOIgyF1H4t3/usercallback";
  var USERCALLBACK_DEV = "https://script.google.com/macros/s/AKfycbydTvvCh6BhKQWPX5XYU0baBLb5BOuhDaSIvirVjsC1/usercallback";
  var payload = {
    client_id : CLIENT_ID,
    client_secret : CLIENT_SECRET,
    redirect_uri : USERCALLBACK_DEV,
    grant_type : "authorization_code",
    access_type : "offline",
    code : e.parameter.code
  };
  var ENDPOINT = "https://accounts.google.com/o/oauth2/token";
  var httpResponse = UrlFetchApp.fetch(ENDPOINT, {muteHttpExceptions: true, method: "post", payload : payload});
  var json = httpResponse.getContentText();
  //return ContentService.createTextOutput(json);
  var accessToken = JSON.parse(json).access_token;
  var refreshToken = JSON.parse(json).refresh_token;
  var expires_in = JSON.parse(json).expires_in;
  var expiresAt = (new Date()).getTime() + expires_in * 1000;
  PropertiesService.getUserProperties().setProperty("accessToken", accessToken);
  PropertiesService.getUserProperties().setProperty("refreshToken", refreshToken);
  PropertiesService.getUserProperties().setProperty("expiresAt", expiresAt);
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  htmlTemplate.authorizationUrl = createAuthorizationUrl();
  var htmlOutput = htmlTemplate.evaluate().setTitle("Google Apps Script Project Browser");
  return htmlOutput;
}//getToken

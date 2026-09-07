function showSidebar() {
  const htmlTemplate = HtmlService.createTemplateFromFile("sidebar");
  const htmlOutput = htmlTemplate.evaluate();
  const ui = SpreadsheetApp.getUi();
  ui.showSidebar(htmlOutput);
}

function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  const menu = SpreadsheetApp.getUi().createAddonMenu();
  menu.addItem("Show sidebar", "showSidebar");
  menu.addToUi();
}

function fetchRequestToken() {
  PropertiesService.getUserProperties().deleteProperty("requestToken");
  //const stateToken = ScriptApp.newStateToken().withMethod(callbackFunction).createToken();
  const params = {
    method: "POST",
    //contentType: "application/json; charset=UTF-8",
    //headers: {
    //  "X-Accept": "application/json"
    //},
    payload: {
      consumer_key: PropertiesService.getScriptProperties().getProperty("consumer_key"),
      redirect_uri: "https://script.google.com/macros/s/AKfycbzYzJtSUVwHc6c9tTEkxOhB_ho8JmUJRSiHetr_p3PrOAmFBquBB7Rp9U06TNEP6v-6/usercallback",
      //state: stateToken,
    },
    muteHttpExceptions: true
  };
  console.log(params);
  const httpResponse = UrlFetchApp.fetch("https://getpocket.com/v3/oauth/request", params);
  const contentText = httpResponse.getContentText();
  console.log(contentText);
  const codekv = contentText.split("&")[0].split("=");
  console.log(codekv);
  if(codekv[0]=="code"){
    const code = codekv[1];
    console.log("request token = " + code)
    PropertiesService.getUserProperties().setProperty("requestToken", code);
    return code;
  }
  throw new Error("contentText");
}//fetchRequestToken


function callbackFunction() {
}

/*
  Run all brief internal test for 'Hash' project.
  @return {void}
*/
function test(){
  Is.test();
  for(var i in this){
    if(typeof this[i] === "function") {
      if(typeof this[i]["test"] === "function"){
        this[i]["test"]();
      }//if
    }//if
  }//for
}//test

function aaa(){
  var url = jsdocUrl();
  Logger.log(url);
  var response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization : "Bearer " + ScriptApp.getOAuthToken(),
    },
    muteHttpExceptions: true
  });
  var responseCode = response.getResponseCode();
  var contentBytes = response.getContent();
  var contentText = response.getContentText();
  var xmlDocument = XmlService.parse(contentText);
  Logger.log(xmlDocument);
}//aaa


/*
  @param {object} e
  @return {HtmlOutput|TextOutput}
*/
function doGet(e) {
  if(e === undefined)  throw "doGet: no input";
  if(e.parameter === undefined) e.parameter = {};
  if(Object.keys(e.parameter).length === 0){
    e.parameter.contentType = "text/html";
  }//if
  if(e.parameter.contentType === undefined) {
    e.parameter.contentType = ContentService.MimeType.JSON;
  }//if

  if(e.parameter.niUri !== undefined) {
    if(e.parameter.salt !== undefined || e.parameter.email !== undefined || e.parameter.date !== undefined) {
      var responseObject = {
        errorMessage: "niUri cannot coexist with any of salt, email or date."
      };
    } else {
      var niUri = e.parameter.niUri;
      var responseObject = {
        niUri: niUri
      };
    }//if
  } else {
    if(e.parameter.salt === undefined || e.parameter.email === undefined) {
      var responseObject = {
        errorMessage: "Both salt and email are required if niUri is not given. date is optional."
      };
    } else {
      if(e.parameter.date === undefined) e.parameter.date = ((new Date()).getYear()).toString();
      var tagUri = buildTagUri(e.parameter.salt, e.parameter.email, e.parameter.date);
      var niUri = computeNiUri(tagUri);
      var responseObject = {
        email: e.parameter.email,
        salt: e.parameter.salt,
        date: e.parameter.date,
        tagUri: tagUri,
        niUri: niUri
      };
    }//if
  }//if
  
  responseObject.contentType = e.parameter.contentType;
  if(responseObject.errorMessage === undefined) {
    responseObject.keys = getKeys(niUri);
  }//if
  
  if(e.parameter.contentType === "text/html") {
    var htmlTemplate = HtmlService.createTemplateFromFile("index");
    htmlTemplate.responseObject = responseObject;
    htmlTemplate.testSalt = testSalt;
    htmlTemplate.testEmail = testEmail;
    htmlTemplate.testDate = testDate;
    htmlTemplate.testKey = testKey;
    htmlTemplate.testValue = testValue;
    htmlTemplate.baseUrl = ScriptApp.getService().getUrl();
    var htmlOutput = htmlTemplate.evaluate();
    htmlOutput.setTitle(PropertiesService.getScriptProperties().getProperty("title"));
    htmlOutput.setFaviconUrl(PropertiesService.getScriptProperties().getProperty("iconUrl"));
    return htmlOutput;
  } else if(e.parameter.contentType === ContentService.MimeType.JSON) {
    var textOutput = ContentService.createTextOutput(JSON.stringify(responseObject));
    textOutput.setMimeType(ContentService.MimeType.JSON);
    return textOutput;   
  }//if
}//doGet

doGet.test = function(){
  //var htmlOutput1 = doGet();
  var htmlOutput2 = doGet({});
  Logger.log("doGet.test: " + Object.prototype.toString.call(htmlOutput2));
  Logger.log("doGet.test: " + htmlOutput2.toString());
  var textOutput1 = doGet({
    parameter: {
      salt: PropertiesService.getScriptProperties().getProperty("testSalt"),
      email: PropertiesService.getScriptProperties().getProperty("testEmail"),
      date: PropertiesService.getScriptProperties().getProperty("testDate")
    }
  });
  Logger.log("doGet.test: " + textOutput1.toString());
  Logger.log("doGet.test: " + textOutput1.getContent());
}//doGet.test

function doGetTest(){
  doGet.test();
}//doGetTest

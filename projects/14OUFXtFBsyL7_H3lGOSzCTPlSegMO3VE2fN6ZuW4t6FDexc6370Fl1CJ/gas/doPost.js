/*
  @param {object} e
*/
function doPost(e) {
  if (e === undefined)  throw "doPost: no input";
  if (e.parameter === undefined) e.parameter = {};
  if (e.postData === undefined) e.postData = Utilities.newBlob("", "text/plain");

  //e.postData = Utilities.newBlob(data)
  //return ContentService.createTextOutput(JSON.stringify(e));
  
  if(e.parameter.niUri !== undefined) {
    if(e.parameter.salt !== undefined || e.parameter.email !== undefined || e.parameter.date !== undefined) {
      var responseObject = {
        errorMessage: "niUri cannot coexist with any of salt, email or date."
      };
    } else {
      var niUri = e.parameter.niUri
      var responseObject = {
        key: e.parameter.key,
        nValueBytes: e.postData.getBytes().length,
        niUri: niUri
      };
    }//if
  } else {
    if(e.parameter.salt === undefined || e.parameter.email === undefined) {
      var responseObject = {
        errorMessage: "Both salt and email are required if niUri is not given. date is optional."
      };
    } else {
      if (e.parameter.date === undefined) {
        e.parameter.date = (new Date()).getYear().toString();
      }//if

      if (e.parameter.key === undefined) {
        e.parameter.key = 'key-' + ((new Date()).getTime() + Math.random());
      }//if

      var tagUri = buildTagUri(e.parameter.salt, e.parameter.email, e.parameter.date);
      var niUri = computeNiUri(tagUri);
      var tagUri = buildTagUri(e.parameter.salt, e.parameter.email, e.parameter.date);
      var responseObject = {
        key: e.parameter.key,
        email: e.parameter.email,
        salt: e.parameter.salt,
        date: e.parameter.date,
        nValueBytes: e.postData.getBytes().length,
        //tagUri: tagUri,
        //niUri: niUri
      }
    }//if
  }//if

  if(responseObject.errorMessage === undefined) {
    var putAt = put(niUri, e.parameter.key, e.postData.getDataAsString());
    responseObject.putAt = putAt;
    responseObject.expiresAt = putAt + 21600 * 1000;
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
    htmlOutput.setFaviconUrl(PropertiesService.getScriptProperties().getProperty("iconUrl"));;
    return htmlOutput;
  } else {
    var textOutput = ContentService.createTextOutput(JSON.stringify(responseObject));
    return textOutput;
  }//if
}// doPost

doPost.test = function(){
  Logger.log("doPost.test: " + doPost({
    parameter: {
      key: PropertiesService.getScriptProperties().getProperty("testKey")
    }
  }).getContent());
  
  Logger.log("doPost.test: " + doPost({
    parameter: {
      salt: testSalt,
      email: testEmail,
      key: testKey,
    },
    postData: Utilities.newBlob(testValue)
  }).getContent());

  Logger.log("doPost.test: " + doPost({
    parameter: {
      salt: testSalt,
      email: testEmail,
      date: testDate,
      key: testKey,
    },
    postData: Utilities.newBlob(testValue)
  }).getContent());
}//doPost.test

function doPostTest(){
  doPost.test();
}//doPostTest
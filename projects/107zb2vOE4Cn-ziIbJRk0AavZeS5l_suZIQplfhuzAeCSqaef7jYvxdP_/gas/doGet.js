function testDoGet() {
  console.log(doGet({
    parameter: {
      keyString: "3df261f8-7c6e-433e-870a-0308598bf6c7",
      email: "test@example.com"
    }
  }).getContent());
}//testDoGet

/**
 * doGet is the endpoint to getFromCache.
 */
function doGet(e) {
  if (Object.keys(e.parameter).length === 0) {
    const htmlTemplate = HtmlService.createTemplateFromFile("index");
    const htmlOutput = htmlTemplate.evaluate();
    return htmlOutput;
  } else {
    try {
      const keyString = getFromCache({
        keyString: e.parameter.keyString,
        email: e.parameter.email,
        emailMd5Base64WebSafe: e.parameter.emailMd5Base64WebSafe
      });
      const textOutput = ContentService.createTextOutput();
      textOutput.setMimeType(ContentService.MimeType.JSON);
      textOutput.setContent(JSON.stringify({
        response: {
          keyString: keyString
        }
      }));
      return textOutput;
    } catch (e) {
      const errorText = e.toString();
      const textOutput = ContentService.createTextOutput();
      textOutput.setMimeType(ContentService.MimeType.JSON);
      textOutput.setContent(JSON.stringify({
        error: {
          code: 3, //gRPC status code of INVALID_ARGUMENT.
          message: e.toString(),
          details: []
        }
      }));
      return textOutput;
    }//try
    console.log("NEVER REACH HERE");
  }//if
}//doGet
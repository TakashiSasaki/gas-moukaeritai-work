function testDoPost() {
  console.log(doPost({
    postData: {
      contents: JSON.stringify({
        email: "test@example.com",
        valueString: "***valueString***"
      })
    }
  }).getContent());
}//testDoPost

/**
 * doPost is the endpoint for putToCache.
 */
function doPost(e) {
  console.log(e);
  if (e.parameter && Object.keys(e.parameter).length > 0) {
    const textOutput = ContentService.createTextOutput();
    textOutput.setMimeType(ContentService.MimeType.JSON);
    textOutput.setContent(JSON.stringify({
      error: {
        code: 3,
        message: "This API does not accept URL parameter with POST method."
      }
    }));
    return textOutput;
  }//if

  try {
    const jsonData = JSON.parse(e.postData.contents);
    const keyString = putToCache({
      keyString: jsonData.keyString,
      valueString: jsonData.valueString,
      email: jsonData.email,
      emailMd5Base64WebSafe: jsonData.emailMd5Base64WebSafe
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
    const textOutput = ContentService.createTextOutput();
    textOutput.setMimeType(ContentService.MimeType.JSON);
    textOutput.setContent(JSON.stringify({
      error: {
        message: e.toString()
      }
    }));
    return textOutput;
  }
  console.log("NEVER REACH HERE");
}//doPost
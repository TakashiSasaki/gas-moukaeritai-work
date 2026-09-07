function doGet(e) {
  if (e.parameter.version === '3') {
    const namespaceUUID = e.parameter.namespace;
    console.log(namespaceUUID);
    const name = decodeURIComponent(e.parameter.name);
    console.log(name);

    // Ensure both parameters are provided
    if (!namespaceUUID || !name) {
      return ContentService.createTextOutput("Error: Missing namespace UUID or name");
    }

    try {
      // Generate the UUID version 3
      const uuid = generateUUIDv3(namespaceUUID, name);
      return ContentService.createTextOutput(uuid);
    } catch (error) {
      return ContentService.createTextOutput("Error: " + error.message);
    }
  }
  if (e.parameter.v === "4") {
    return ContentService.createTextOutput("not implemented yet");
  }
  if (e.parameter.v === "5") {
    return ContentService.createTextOutput("not implemented yet");
  }
  const htmlTemplate = HtmlService.createTemplateFromFile("index");
  htmlTemplate.url = ScriptApp.getService().getUrl() + "?version=3&namespace=6ba7b810-9dad-11d1-80b4-00c04fd430c8&name=www.example.com";
  const htmlOutput = htmlTemplate.evaluate();
  return htmlOutput;
}

function testv3() {
  console.log(ScriptApp.getService().getUrl());
  const expectedUUID = "5df41881-3aed-3515-88a7-2f4a814cf09e";
  const url = PropertiesService.getScriptProperties().getProperty("BASE_URL") + "?version=3&namespace=6ba7b810-9dad-11d1-80b4-00c04fd430c8&name=www.example.com";
  console.log(url);
  // Send a request to the web app with the specified path and parameters
  const response = UrlFetchApp.fetch(url);
  // Retrieve the content of the response
  const resultUUID = response.getContentText();

  // Check if the result matches the expected UUID
  if (resultUUID === expectedUUID) {
    Logger.log("Test passed: The result UUID matches the expected UUID.");
  } else {
    Logger.log("Test failed: Expected " + expectedUUID + ", but got " + resultUUID);
  }
}

function testv3hello() {
  const expectedUUID = "8e06d2b7-c2e7-3d89-888b-f65bcb69e66a";
  const url = PropertiesService.getScriptProperties().getProperty("BASE_URL") + "?version=3&namespace=38434339-75b4-4968-8469-f4cc6787d5da&name="
  + encodeURIComponent("こんにちは");
  console.log(url);
  // Send a request to the web app with the specified path and parameters
  const response = UrlFetchApp.fetch(url);

  // Retrieve the content of the response
  const resultUUID = response.getContentText();

  // Check if the result matches the expected UUID
  if (resultUUID === expectedUUID) {
    Logger.log("Test passed: The result UUID matches the expected UUID.");
  } else {
    Logger.log("Test failed: Expected " + expectedUUID + ", but got " + resultUUID);
  }
}

function testKonnichiwa(){
  console.log(Utilities.base64EncodeWebSafe("こんにちは"));
  console.log(Utilities.base64EncodeWebSafe("こんにちは", Utilities.Charset.UTF_8));
  
}

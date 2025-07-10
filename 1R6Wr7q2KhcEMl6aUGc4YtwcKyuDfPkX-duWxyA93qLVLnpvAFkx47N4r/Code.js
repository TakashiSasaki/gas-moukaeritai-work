function doGet(e) {
  console.log(e);
  try {
    if (!e.pathInfo && (!e.parameter || !e.parameter.fileId || !e.parameter.scrollTo)) {
      const htmlTemplate = HtmlService.createTemplateFromFile("index");
      const htmlOutput = htmlTemplate.evaluate();
      htmlOutput.setTitle("Google Colaboratory Cell Link");
      return htmlOutput;
    }

    var fileId;
    var scrollTo;
    if (e.pathInfo) {
      const m = e.pathInfo.match(/([a-zA-Z0-9_]+)\/([a-zA-Z0-9_]+)/);
      fileId = m[1];
      scrollTo = m[2];
    } else {
      fileId = e.parameter.fileId;
      scrollTo = e.parameter.scrollTo;
    }

    if(true || e.parameter && e.parameter.debug){
      const textOutput = ContentService.createTextOutput();
      textOutput.setContent("debug mode");
      textOutput.setMimeType(ContentService.MimeType.TEXT);
      return textOutput;
    }

    //const json = getByDriveApi(fileId);
    const json = getByWebContentLink(fileId);
    const parsed = JSON.parse(json);
    const cells = parsed.cells;
    var source = "";
    cells.forEach(cell => {
      if (cell.cell_type !== "code") return;
      if (cell.metadata.id !== scrollTo) return;
      source += cell.source.join("");
    });
    const textOutput = ContentService.createTextOutput();
    textOutput.setMimeType(ContentService.MimeType.JSON);
    textOutput.setContent(source);
    return textOutput;
  } catch (e) {
    const textOutput = ContentService.createTextOutput();
    textOutput.setMimeType(ContentService.MimeType.JSON);
    textOutput.setContent("# access denied");
    textOutput.append("# " + e.message);
    return textOutput;
  }
}

/*
function getByDriveApp(fileId) {
  const file = DriveApp.getFileById(fileId);
  if (file.getSharingAccess() != DriveApp.Access.ANYONE && file.getSharingAccess() != DriveApp.Access.ANYONE_WITH_LINK) {
    throw new Error("access denied.");
  }
  const blob = file.getAs("application/vnd.google.colaboratory");
  return blob.getDataAsString();
}

function getByDriveApi(fileId) {
  if (fileId === undefined) fileId = "1DnfzEPTWEhPKhXH5qNA05KUkQBeEPTmr";
  const file = Drive.Files.get(fileId);
  console.log(file.downloadUrl);
  const httpResponse = UrlFetchApp.fetch(file.downloadUrl, {
    headers: {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken()
    }
  });
  return httpResponse.getContentText()
}*/

function getByWebContentLink(fileId) {
  const httpResponse = UrlFetchApp.fetch(webContentLink(fileId));
  return httpResponse.getContentText();
}

function webContentLink(fileId) {
  return "https://drive.google.com/uc?id=" + fileId + "&export=download";
}

function downloadLink(fileId) {
  return "https://www.googleapis.com/drive/v2/files/" + fileId + "?alt=media&source=downloadUrl";
}

function exampleColabUrl() {
  return PropertiesService.getScriptProperties().getProperty("exampleColabUrl");
}

function devUrl() {
  return PropertiesService.getScriptProperties().getProperty("devUrl");
}

function execUrl() {
  return PropertiesService.getScriptProperties().getProperty("execUrl");
}

function editUrl() {
  return PropertiesService.getScriptProperties().getProperty("editUrl");
}
function getDownloadUrl() {
  const sheet = getMailSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();
  const url = values[0][1];
  if (typeof url !== "string") {
    throw new Error("The URL for download does not exist.");
  }
  const response = UrlFetchApp.fetch(url);
  console.log(response.getResponseCode());
  const blob = response.getBlob();
  console.log(blob.getName());
  console.log(blob.getContentType());
  //const folder = getFolder();
  //folder.createFile(blob);
  Utilities.unzip(blob);
}

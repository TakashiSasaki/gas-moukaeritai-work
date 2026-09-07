function doGet() {
  const textOutput = ContentService.createTextOutput();
  textOutput.setContent("ContentService test");
  textOutput.setMimeType(ContentService.MimeType.TEXT)
  return textOutput;
}

function dummy(){
  DriveApp.getFileById("a");
}

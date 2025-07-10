function doGet() {
  var textOutput = ContentService.createTextOutput();
  textOutput.setMimeType(ContentService.MimeType.JAVASCRIPT);
  return textOutput;
}

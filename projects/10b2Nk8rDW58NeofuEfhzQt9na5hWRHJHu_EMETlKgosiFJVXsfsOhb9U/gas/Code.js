function doGet() {
  return ContentService.createTextOutput("{'message':'hello v4'}").setMimeType(ContentService.MimeType.JSON);
}

function test(){
  UrlFetchApp.fetch("https://example.com/");
}
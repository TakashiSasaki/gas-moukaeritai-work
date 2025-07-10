/*
MIMEタイプは application/json; charset=utf-8 で返っているっぽい。
*/

function doGet(e) {
  e.method = "GET";
  return ContentService.createTextOutput(JSON.stringify(e, undefined, 4))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  e.method = "POST";
  return ContentService.createTextOutput(JSON.stringify(e, undefined, 4))
    .setMimeType(ContentService.MimeType.JSON);
}
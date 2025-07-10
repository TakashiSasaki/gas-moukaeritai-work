function doGet(e) {
  if(typeof e.parameter.test !== "undefined"){
    return ContentService.createTextOutput(test());
  }
}

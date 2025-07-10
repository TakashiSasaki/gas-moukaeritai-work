/**
  @param {String} colorCode, i.e. "#ffeedd"
  @param {Range?} range
  @returns {void}
*/
function setBackgroundColor(colorCode, range) {
  CacheService.getDocumentCache().put("onEditColor", "red");
}

function setBackgroundToRed(range){
  if(range === undefined) {
    range = SpreadsheetApp.getActiveRange();
  }
  range.setBackground("red");
}

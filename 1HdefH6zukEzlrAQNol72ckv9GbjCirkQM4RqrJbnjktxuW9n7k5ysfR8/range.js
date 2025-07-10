function copyRange() {
  var range = SpreadsheetApp.getActiveRange();
  var values = range.getValues();
  var notes = range.getNotes();
  var backgrounds = range.getBackgrounds();
  var fontColors = range.getFontColors();
  var numberFormats = range.getNumberFormats();
  var formulas = range.getFormulas();
  CacheService.getUserCache().put("values", JSON.stringify(values));
  CacheService.getUserCache().put("notes", JSON.stringify(notes));
  CacheService.getUserCache().put("backgrounds", JSON.stringify(backgrounds));
  CacheService.getUserCache().put("fontColors", JSON.stringify(fontColors));
  CacheService.getUserCache().put("numberFormats", JSON.stringify(numberFormats));
  CacheService.getUserCache().put("formulas", JSON.stringify(formulas));
}
copyRange.title="Copy selected range";

function copyHeader(){
  if(SpreadsheetApp.getActiveSheet().getFrozenRows() !== 1) {
    throw ("One row should be frozen as header row");
  }
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = SpreadsheetApp.getActiveRange();
  if(range === null) {
    range = sheet.getDataRange();
  }
  var header = sheet.getRange(1, range.getColumn(), 1, range.getWidth()).getValues()[0];
  Logger.log(header);
  CacheService.getUserCache().put("header", JSON.stringify(header));
}
copyHeader.title="Copy Header of selected range";
function getSheetValuesInOneText(){
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getDataRange();
  var rows = range.getValues();
  var texts = [];
  for(var iRow in rows) {
    var columns = rows[iRow];
    for(var iColumn in columns) {
      var cell = columns[iColumn];
      texts.push(cell);
    }
  }
  var text = texts.join('');
  return text;
}

function parseMailFilterXml(text) {
  var filterObjects = [];
  var document = XmlService.parse(text);
  var allContent = document.getAllContent();
  var elements = allContent[0].asElement().getAllContent();
  for(var iElement in elements) {
    var element = elements[iElement];
    var elementName = element.asElement().getName();
    if(elementName !== "entry") continue;
    var filterObject = {};
    var elementsInEntry = element.asElement().getAllContent();
    for(var iElementsInEntry in elementsInEntry) {
      var elementInEntry = elementsInEntry[iElementsInEntry];
      if("id" === elementInEntry.asElement().getName()) {
        var id = elementInEntry.getValue();
        filterObject["id"] = id;
      }
      if("updated" === elementInEntry.asElement().getName()) {
        var updated = elementInEntry.getValue();
        filterObject["updated"] = updated;
      }//if
      if("property" === elementInEntry.asElement().getName()){
        var name = elementInEntry.asElement().getAttribute("name").getValue();
        var value = elementInEntry.asElement().getAttribute("value").getValue();
        filterObject[name] = value;
      }//if
    }//for
    filterObjects.push(filterObject);
  }//for
  return filterObjects;
}

function test(){
  var spreadsheet = SpreadsheetApp.openById("1YM9uwXl8yqnGSIgQ7JubLaxtCM3wkwI7p_xPnG4SRIQ");
  var sheet = spreadsheet.getSheetByName("mailFilters.xml");
  SpreadsheetApp.setActiveSpreadsheet(spreadsheet);
  SpreadsheetApp.setActiveSheet(sheet);
  var text = getSheetValuesInOneText();
  var filters = parseMailFilterXml(text);
  var headers = getHeaders(filters);
  Logger.log(headers);
}

function getHeaders(objects){
  var headers = {};
  for(var i in objects) {
    var o = objects[i];
    for(var k in o){
      if(k in headers) continue;
      headers[k] = Object.keys(headers).length;
    }
  }
  return headers;
}

function testGetHeaders(){
  var o1 = {a:1, b:2};
  var o2 = {a:2, a:3, d:4};
  var o3 = {b:3, c:1};
  Logger.log(getHeaders([o1,o2,o3]));
}
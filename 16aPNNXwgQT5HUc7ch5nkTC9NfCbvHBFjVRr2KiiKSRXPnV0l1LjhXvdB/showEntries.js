function getEntries(form) {
  if(form === undefined) {
    form = FormApp.getActiveForm();
  }
  if(form === null) {
    form = getForm_();
  }
  var jsonString = CacheService.getScriptCache().get(form.getId());
  if(typeof jsonString === "string") {
    var entries = JSON.parse(jsonString);
    return entries;
  }
  var publishedUrl = form.getPublishedUrl();
  var httpResponse = UrlFetchApp.fetch(publishedUrl);
  var contentText = httpResponse.getContentText();
  var match = contentText.match(/ name="(entry\.[0-9]+)" /g);
  var entries = [];
  for(var i in match) {
    var match2 = match[i].match(/entry\.[0-9]+/);
    entries.push(match2[0]);
  }
  Logger.log(entries);
  CacheService.getScriptCache().put(form.getId(), JSON.stringify(entries));
  return entries;
}


function showEntries(){
  var form = FormApp.getActiveForm();
  CacheService.getScriptCache().remove(form.getId());
  var entries = getEntries(form);
  var ui = FormApp.getUi();
  ui.alert("entries", JSON.stringify(entries), ui.ButtonSet.OK);
}

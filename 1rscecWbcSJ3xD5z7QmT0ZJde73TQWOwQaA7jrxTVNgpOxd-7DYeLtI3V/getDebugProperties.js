function getDebugSpreadsheetId() {
  var spreadsheet = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty("DEBUG_SPREADSHEET_URL"));
  var spreadsheet_id = spreadsheet.getId();
  PropertiesService.getScriptProperties().setProperty("DEBUG_SPREADSHEET_ID", spreadsheet_id);
  Logger.log(spreadsheet_id);
}

function getDebugFormId(){
  var sp = PropertiesService.getScriptProperties();
  var DEBUG_FORM_URL = sp.getProperty("DEBUG_FORM_URL");
  var debug_form = FormApp.openByUrl(DEBUG_FORM_URL);
  var debug_form_id = debug_form.getId();
  sp.setProperty("DEBUG_FORM_ID", debug_form_id);
  var debug_form_published_url = debug_form.getPublishedUrl();
  sp.setProperty("DEBUG_FORM_PUBLISHED_URL", debug_form_published_url);
}

function getDebugFormEntryNamesAndSubmitUrl(){
  var sp = PropertiesService.getScriptProperties();
  var debug_form_published_url = sp.getProperty("DEBUG_FORM_PUBLISHED_URL");
  var http_response = UrlFetchApp.fetch(debug_form_published_url);
  var content_text = http_response.getContentText();
  var debug_form_entry_names = PublishedFormParser.getEntryNames(content_text);
  sp.setProperty("DEBUG_FORM_ENTRY_NAMES", JSON.stringify(debug_form_entry_names));
  var debug_form_submit_url = PublishedFormParser.getSubmitUrl(content_text);
  sp.setProperty("DEBUG_FORM_SUBMIT_URL", debug_form_submit_url);
}


function postDebugForm(){
  var sp = PropertiesService.getScriptProperties();
  var DEBUG_FORM_SUBMIT_URL = sp.getProperty("DEBUG_FORM_SUBMIT_URL");
  var DEBUG_FORM_ENTRY_NAMES = sp.getProperty("DEBUG_FORM_ENTRY_NAMES");
  var debug_form_entry_names = JSON.parse(DEBUG_FORM_ENTRY_NAMES);
  var payload = {};
  for(i in debug_form_entry_names) {
     var name = debug_form_entry_names[i];
     var value = i;
     payload[name] = value;
  }
  
  var option = {
    "method" : "POST",
    "payload" : payload
  }
  var http_response = UrlFetchApp.fetch(DEBUG_FORM_SUBMIT_URL, option);
  Logger.log(http_response);
}


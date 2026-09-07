function doGet(){
  addHtmlOutput(HtmlService.createHtmlOutputFromFile("sample_tab1").setTitle("title_tab1"));
  addHtmlOutput(HtmlService.createHtmlOutputFromFile("sample_tab2").setTitle("title_tab2"));
  addHeader(HtmlService.createHtmlOutputFromFile("sample_css"));
  addGoogleDocument("18s2UMxOJDh2hVZ2xxcPvkPCqFd1RnPcJIVCrrndSc04", "tesuto");
  addScriptDocument(ScriptApp.getService().getUrl(), ScriptApp.getScriptId(), "Html Template Library");
  //var html_output = tabs([sample_tab1, sample_tab2], sample_css, "18s2UMxOJDh2hVZ2xxcPvkPCqFd1RnPcJIVCrrndSc04");
  var output = getHtmlOutput("Html Template Library");
  return output;
}

htmlOutputs = [];
header = undefined;

function addHeader(html_output) {
  header = html_output;
}

function addHtmlOutput(html_output, title){
  if(title) {
    html_output.setTitle(title);
  }
  htmlOutputs.push(html_output);
}

function addIframeTab(url, title){
  var template = HtmlService.createTemplateFromFile("template-iframe");
  template.url = url;
  var output = template.evaluate();
  addHtmlOutput(output, title);
}

function addScriptDocument(script_url, script_id, title) {
  var template = HtmlService.createTemplateFromFile("template-script");
  template.scriptUrl = script_url;
  template.scriptId = script_id;
  var output = template.evaluate();
  addHtmlOutput(output, title);
}

function addGoogleDocument(document_id, title){
  var template = HtmlService.createTemplateFromFile("template-document");
  template.documentId = document_id;
  var output = template.evaluate();
  addHtmlOutput(output, title);
}

function addGoogleSpreadsheet(spreadsheet_id, title){
  var template = HtmlService.createTemplateFromFile("template-spreadsheet");
  template.spreadsheetId = spreadsheet_id;
  var output = template.evaluate();
  addHtmlOutput(output, title);
}

function addGoogleSpreadsheetEdit(spreadsheet_id, title){
  addGoogleSpreadsheet_(spreadsheet_id, title, "edit");
}

function addGoogleSpreadsheetPub(spreadsheet_id, title){
  addGoogleSpreadsheet_(spreadsheet_id, title, "pub?embedded=true");
}

function addGoogleSpreadsheet_(spreadsheet_id, title, edit_or_pub){
  var template = HtmlService.createTemplateFromFile("template-spreadsheet");
  template.spreadsheetId = spreadsheet_id;
  template.editOrPub = edit_or_pub;
  var output = template.evaluate();
  addHtmlOutput(output, title);
}

function getHtmlOutput(title){
  var template = HtmlService.createTemplateFromFile("tabs");
  //template.title = title;
  //template.htmlOutputs = htmlOutputs;
  var output = template.evaluate();
  output.setTitle(title)
  return output;
}

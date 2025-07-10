var URL=[];
function publishForGoogleVisualization() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var sheet = ss.getActiveSheet();
  var gid = sheet.getSheetId();
  var sid = ss.getId();
  var url = "https://spreadsheets.google.com/tq";
  url += "?key=" + sid;
  url += "&gid=" + gid;
  url += "&pub=1";
  var httpResponse = UrlFetchApp.fetch(url);
  var json = httpResponse.getContentText();
  var template =
    '<script src="https://unpkg.com/prettier@1.19.1/standalone.js"></script>' +
    '<script src="https://unpkg.com/prettier@1.19.1/parser-typescript.js"></script>' +
    '<input style="width:99%" readonly="1" value="' +
    url +
    '">' +
    '<pre class="prettyprint">' +
    json +
    "</pre>" +
    "<script>" +
    " setTimeout(()=>{var x = document.querySelector('pre'); x.innerText = prettier.format(x.innerText, {parser: 'typescript', plugins: prettierPlugins});}, 100);" +
    "</script>";
  var htmlTemplate = HtmlService.createTemplate(template);
  var htmlOutput = htmlTemplate.evaluate();
  ui.showModalDialog(htmlOutput, arguments.callee.caption);
} //publishForGoogleVisualization
URL.push([publishForGoogleVisualization, "google.visualization.Query.setResponse"]);

function publishAsHtml() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var sheet = ss.getActiveSheet();
  var gid = sheet.getSheetId();
  var sid = ss.getId();
  var url = "https://docs.google.com/spreadsheets/d/";
  url += sid;
  url += "/pubhtml";
  url += "?gid=" + gid;
  url += "&single=true";
  var template =
    '<input style="width:99%;" readonly="1" value="' +
    url +
    '">' +
    '<iframe style="width:99%; height:30em;" src="' +
    url +
    '" onload="this.style.height=this.contentWindow.document.documentElement.scrollHeight"></iframe>';
  var htmlTemplate = HtmlService.createTemplate(template);
  var htmlOutput = htmlTemplate.evaluate();
  ui.showModalDialog(htmlOutput, arguments.callee.caption);
}//publishAsHtml
URL.push([publishAsHtml, "publish as HTML"]);

function feedSpreadsheets() {
  var ui = SpreadsheetApp.getUi();
  var documentUrl =
    "https://developers.google.com/sheets/api/v3/worksheets#retrieve_a_list_of_spreadsheets";
  var url = "https://spreadsheets.google.com/feeds/spreadsheets/private/full";
  var template =
    '<input style="width:99%;" readonly="1" value="' +
    url +
    '">' +
    '<iframe style="width:99%; height:30em;" src="' +
    url +
    '" onload="this.style.height=this.contentWindow.document.documentElement.scrollHeight"></iframe>';
  var htmlTemplate = HtmlService.createTemplate(template);
  var htmlOutput = htmlTemplate.evaluate();
  ui.showModalDialog(htmlOutput, arguments.callee.caption);
}//feedSpreadsheets
URL.push([feedSpreadsheets, "Retrieve a list of spreadsheets"]);

function feedSheets_(publicOrPrivate, basicOrFull) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var sheet = ss.getActiveSheet();
  var gid = sheet.getSheetId();
  var sid = ss.getId();
  var url =
    "https://spreadsheets.google.com/feeds/worksheets/1VKIWnWwS3tXcAtH3tlJ2-G2-u3NgtgfTgCCBFT53qrE/";
  url += publicOrPrivate;
  url += "/";
  url += basicOrFull;
  var title =
    "Retrieve a list of sheets (" + publicOrPrivate + ", " + basicOrFull + ")";
  var template = '<input style="width:99%;" readonly="1" value="' + url + '">';
  template +=
    "<a href='https://developers.google.com/sheets/api/v3/worksheets#retrieve_a_list_of_spreadsheets' target='v3document'>Spreadsheet API V3 (legacy)</a>";
  template += '<iframe style="width:99%; height:30em;" src="';
  template += url;
  template +=
    '" onload="this.style.height=this.contentWindow.document.documentElement.scrollHeight"></iframe>';
  var htmlTemplate = HtmlService.createTemplate(template);
  var htmlOutput = htmlTemplate.evaluate();
  ui.showModalDialog(htmlOutput, title);
}

function feedSheetsPrivateBasic() {
  feedSheets_("private", "basic");
}//feedSheetsPrivateBasic
URL.push([feedSheetsPrivateBasic, "Retrieve a list of sheets (private, basic)"]);

function feedSheetsPrivateFull() {
  feedSheets_("private", "full");
}//feedSheetsPrivateFull
URL.push([feedSheetsPrivateFull, "Retrieve a list of sheets (private, full)"]);

function feedSheetsPublicBasic() {
  feedSheets_("public", "basic");
}//feedSheetsPublicBasic
URL.push([feedSheetsPublicBasic, "Retrieve a list of sheets (public, basic)"]);

function feedSheetsPublicFull() {
  feedSheets_("public", "full");
}//feedSheetsPublicFull
URL.push([feedSheetsPublicFull, "Retrieve a list of sheets (public, full)"]);

function queryAsHtml() {
  var ui = SpreadsheetApp.getUi();
  var promptResponse = ui.prompt(
    "Number of header rows",
    "Type positive number or leave it empty.",
    ui.ButtonSet.OK_CANCEL
  );
  if (promptResponse.getSelectedButton() != ui.Button.OK) return;
  var sHeaderRows = promptResponse.getResponseText();
  var promptResponse = ui.prompt(
    "Query string",
    "Type SELECT statement in Google Visualization API Query Language or leave it empty.",
    ui.ButtonSet.OK_CANCEL
  );
  if (promptResponse.getSelectedButton() != ui.Button.OK) return;
  var sGvizQuery = promptResponse.getResponseText();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var sheet = ss.getActiveSheet();
  var gid = sheet.getSheetId();
  var sheet_name = encodeURIComponent(sheet.getSheetName());
  var sid = ss.getId();

  var url = "https://docs.google.com/spreadsheets/d/";
  url += sid;
  url += "/gviz/tq";
  url += "?gid=" + gid;
  url += "&tqx=out:html";
  if (sHeaderRows != "") {
    url += "&headers=" + parseInt(sHeaderRows);
  } //if
  if (sGvizQuery != "") {
    url += "&tq=" + encodeURIComponent(sGvizQuery);
  } //if

  var template = '<input style="width:99%;" readonly="1" value="' + url + '">';
  template +=
    "<a href='https://developers.google.com/chart/interactive/docs/querylanguage' target='queryLanguage'>Query Language Reference (Version 0.7)</a>";
  template += '<iframe style="width:99%; height:30em;" src="';
  template += url;
  template +=
    '" onload="this.style.height=this.contentWindow.document.documentElement.scrollHeight"></iframe>';
  var htmlTemplate = HtmlService.createTemplate(template);
  var htmlOutput = htmlTemplate.evaluate();
  ui.showModalDialog(htmlOutput, arguments.callee.caption);
} //queryAsHtml
URL.push([queryAsHtml, "Query and get HTML"]);

function queryAsJson() {
  var ui = SpreadsheetApp.getUi();
  var promptResponse = ui.prompt(
    "Number of header rows",
    "Type positive number or leave it empty.",
    ui.ButtonSet.OK_CANCEL
  );
  if (promptResponse.getSelectedButton() != ui.Button.OK) return;
  var sHeaderRows = promptResponse.getResponseText();
  var promptResponse = ui.prompt(
    "Query string",
    "Type SELECT statement in Google Visualization API Query Language or leave it empty.",
    ui.ButtonSet.OK_CANCEL
  );
  if (promptResponse.getSelectedButton() != ui.Button.OK) return;
  var sGvizQuery = promptResponse.getResponseText();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var sheet = ss.getActiveSheet();
  var gid = sheet.getSheetId();
  var sheet_name = encodeURIComponent(sheet.getSheetName());
  var sid = ss.getId();

  var url = "https://docs.google.com/spreadsheets/d/";
  url += sid;
  url += "/gviz/tq";
  url += "?gid=" + gid;
  if (sHeaderRows != "") {
    url += "&headers=" + parseInt(sHeaderRows);
  } //if
  if (sGvizQuery != "") {
    url += "&tq=" + encodeURIComponent(sGvizQuery);
  } //if

  var fetchOption = {
    headers: {
      Authorization: "Bearer " + ScriptApp.getOAuthToken()
    }
  };
  var httpResponse = UrlFetchApp.fetch(url, fetchOption);
  var json = httpResponse.getContentText();
  var template =
    '<script src="https://unpkg.com/prettier@1.19.1/standalone.js"></script>' +
    '<script src="https://unpkg.com/prettier@1.19.1/parser-typescript.js"></script>' +
    '<input style="width:99%" readonly="1" value="' +
    url +
    '">' +
    '<pre class="prettyprint">' +
    json +
    "</pre>" +
    "<script>" +
    " setTimeout(()=>{var x = document.querySelector('pre'); x.innerText = prettier.format(x.innerText, {parser: 'typescript', plugins: prettierPlugins});}, 100);" +
    "</script>";
  var htmlTemplate = HtmlService.createTemplate(template);
  var htmlOutput = htmlTemplate.evaluate();
  ui.showModalDialog(htmlOutput, arguments.clalee.caption);
}//queryAsJson
URL.push([queryAsJson, "Query and get JSON"]);

function queryAsCsv() {
  var ui = SpreadsheetApp.getUi();
  var promptResponse = ui.prompt(
    "Number of header rows",
    "Type positive number or leave it empty.",
    ui.ButtonSet.OK_CANCEL
  );
  if (promptResponse.getSelectedButton() != ui.Button.OK) return;
  var sHeaderRows = promptResponse.getResponseText();
  var promptResponse = ui.prompt(
    "Query string",
    "Type SELECT statement in Google Visualization API Query Language or leave it empty.",
    ui.ButtonSet.OK_CANCEL
  );
  if (promptResponse.getSelectedButton() != ui.Button.OK) return;
  var sGvizQuery = promptResponse.getResponseText();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var sheet = ss.getActiveSheet();
  var gid = sheet.getSheetId();
  var sheet_name = encodeURIComponent(sheet.getSheetName());
  var sid = ss.getId();

  var url = "https://docs.google.com/spreadsheets/d/";
  url += sid;
  url += "/gviz/tq";
  url += "?gid=" + gid;
  url += "&tqx=out:csv";
  if (sHeaderRows != "") {
    url += "&headers=" + parseInt(sHeaderRows);
  } //if
  if (sGvizQuery != "") {
    url += "&tq=" + encodeURIComponent(sGvizQuery);
  } //if

  var fetchOption = {
    headers: {
      Authorization: "Bearer " + ScriptApp.getOAuthToken()
    }
  };
  var httpResponse = UrlFetchApp.fetch(url, fetchOption);
  var csv = httpResponse.getContentText();
  var template = "";
  template += '<input style="width:99%" readonly="1" value="' + url + '">';
  template += "<pre>";
  template += csv;
  template += "</pre>";
  var htmlTemplate = HtmlService.createTemplate(template);
  var htmlOutput = htmlTemplate.evaluate();
  ui.showModalDialog(htmlOutput, arguments.callee.caption);
}//queryAsCsv
URL.push([queryAsCsv, "Query and get CSV"]);

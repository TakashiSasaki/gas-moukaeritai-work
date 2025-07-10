Help = [];

function showJsdoc() {
  var url =
    "https://script.google.com/macros/library/versions/d/" +
    ScriptApp.getScriptId();
  var template = "";
  template += '<a target="jsdoc" href="' + url + '">JSDoc of this addon</a>';
  template += '<iframe style="width:99%; height:30em;" src="';
  template += url;
  template +=
    '" onload="this.style.height=this.contentWindow.document.documentElement.scrollHeight"></iframe>';
  var htmlTemplate = HtmlService.createTemplate(template);
  var htmlOutput = htmlTemplate.evaluate();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  ui.showModalDialog(htmlOutput, arguments.callee.caption);
} //showJsdoc
Help.push([showJsdoc, "Show JSDoc of this Addon Script"]);

function showAuthorizationInfo() {
  var o = {
    CUSTOM_FUNCTION: {
      status:
        "" +
        ScriptApp.getAuthorizationInfo(
          ScriptApp.AuthMode.CUSTOM_FUNCTION
        ).getAuthorizationStatus(),
      url: ScriptApp.getAuthorizationInfo(
        ScriptApp.AuthMode.CUSTOM_FUNCTION
      ).getAuthorizationUrl()
    },
    FULL: {
      status:
        "" +
        ScriptApp.getAuthorizationInfo(
          ScriptApp.AuthMode.FULL
        ).getAuthorizationStatus(),
      url: ScriptApp.getAuthorizationInfo(
        ScriptApp.AuthMode.FULL
      ).getAuthorizationUrl()
    },
    LIMITED: {
      status:
        "" +
        ScriptApp.getAuthorizationInfo(
          ScriptApp.AuthMode.LIMITED
        ).getAuthorizationStatus(),
      url: ScriptApp.getAuthorizationInfo(
        ScriptApp.AuthMode.LIMITED
      ).getAuthorizationUrl()
    },
    NONE: {
      status:
        "" +
        ScriptApp.getAuthorizationInfo(
          ScriptApp.AuthMode.NONE
        ).getAuthorizationStatus(),
      url: ScriptApp.getAuthorizationInfo(
        ScriptApp.AuthMode.NONE
      ).getAuthorizationUrl()
    }
  };
  var json = JSON.stringify(o, null, "  ");
  var html = "<pre>" + json + "</pre>";
  var htmlOutput = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    arguments.callee
  );
} //showAuthorizationInfo
Help.push([showAuthorizationInfo, "Show authorization status and URL of the addon"]);

global = this;
function showAllFunctionNamesNotInAddonMenu(){
  var addedFunctionNames = recreateMenu();
  var notAddedFunctionNames = [];
  Object.keys(global).map(function(x){
    if(typeof global[x] === "function" && x.slice(-1) !== "_"){
      if(addedFunctionNames.indexOf(x) >= 0) return;
      if(x === "onInstall") return;
      if(x === "onOpen") return;
      notAddedFunctionNames.push(x);
    }//if
  });
  notAddedFunctionNames.sort();
  var html = "<pre>" + notAddedFunctionNames.join("\n") + "</pre>";
  var htmlOutput = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    arguments.callee.caption
  );
}//showAllFunctionNamesNotInAddonMenu
Help.push([showAllFunctionNamesNotInAddonMenu, "Show all functions not in this addon menu"]);

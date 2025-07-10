function showInstalledTriggers() {
  var oo = {
    userTriggers: [],
    projectTriggers: []
  };

  var projectTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < projectTriggers.length; ++i) {
    var projectTrigger = projectTriggers[i];
    var o = {
      eventType: projectTrigger.getEventType(),
      handlerFunction: projectTrigger.getHandlerFunction(),
      triggerSource: projectTrigger.getTriggerSource(),
      triggerSourceId: projectTrigger.getTriggerSourceId(),
      uniqueId: projectTrigger.getUniqueId()
    };
    oo["projectTriggers"].push(o);
  }

  var userTriggers = ScriptApp.getUserTriggers(
    SpreadsheetApp.getActiveSpreadsheet()
  );
  for (var i = 0; i < userTriggers.length; ++i) {
    var userTrigger = userTriggers[i];
    var o = {
      eventType: userTrigger.getEventType(),
      handlerFunction: userTrigger.getHandlerFunction(),
      triggerSource: userTrigger.getTriggerSource(),
      triggerSourceId: userTrigger.getTriggerSourceId(),
      uniqueId: userTrigger.getUniqueId()
    };
    oo["userTriggers"].push(o);
  }

  var j = JSON.stringify(oo);

  var htmlOutput = HtmlService.createHtmlOutput("<pre>" + j + "</pre>");
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, arguments.callee.caption);
}//showInstalledTriggers

showInstalledTriggers.caption = "Show installed triggers";
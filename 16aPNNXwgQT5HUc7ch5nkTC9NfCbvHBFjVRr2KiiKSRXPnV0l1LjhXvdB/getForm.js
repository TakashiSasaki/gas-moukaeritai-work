function getForm_(propertyName) {
  if(propertyName === undefined) {
    propertyName = ScriptApp.getScriptId();
  }
  var formId = PropertiesService.getUserProperties().getProperty(propertyName);
  if(typeof formId === "string") {
    var form = FormApp.openById(formId);
    if(form === null) {
      var form = FormApp.create((new Date()).toString());
    }
  } else {
    var form = FormApp.create((new Date()).toString());
  }
  formId = form.getId();
  PropertiesService.getUserProperties().setProperty(propertyName, formId);
  return form;
}  
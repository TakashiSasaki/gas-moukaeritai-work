function set_(name, value) {
  var json_string = PropertiesService.getScriptProperties().getProperty(Session.getTemporaryActiveUserKey() + ScriptApp.getScriptId());
  try {
    var json_object = JSON.parse(json_string);
    json_object[name] = value;
    PropertiesService.getScriptProperties().setProperty(Session.getTemporaryActiveUserKey() + ScriptApp.getScriptId(), JSON.stringify(json_object));
    return value;
  } catch (e) {
    var json_object = {};
    json_object[name] = value;
    PropertiesService.getScriptProperties().setProperty(Session.getTemporaryActiveUserKey() + ScriptApp.getScriptId(), JSON.stringify(json_object));
    return value;
  }
}


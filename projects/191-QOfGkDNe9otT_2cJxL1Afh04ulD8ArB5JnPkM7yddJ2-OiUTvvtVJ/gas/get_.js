function get_(name){
  var json_string = PropertiesService.getScriptProperties().getProperty(Session.getTemporaryActiveUserKey() + ScriptApp.getScriptId());
  if(!json_string) {
    throw "no authorization data";
  }
  var json_object = JSON.parse(json_string);
  var value = json_object[name];
  return value;
}

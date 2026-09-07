/**
  @return {String} URL of the jsdoc page for the calling project.
*/
function jsdocUrl() {
  var base = "https://script.google.com/macros/library/versions/d/";
  return base + ScriptApp.getScriptId();
}//jsdocUrl

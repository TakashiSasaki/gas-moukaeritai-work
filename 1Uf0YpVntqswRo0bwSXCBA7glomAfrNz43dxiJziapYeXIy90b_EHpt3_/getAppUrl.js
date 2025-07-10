/**
 * Returns the published web app URL.
 */
function getAppUrl() {
  const url = ScriptApp.getService().getUrl();
  Logger.log(url);
  return url;
}

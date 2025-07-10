/**
  @param app {SpreadsheetApp|DocumentApp|SlidesApp}
  @param global {object} global object of parent script
  @param jsdoitUser {string} optional
  @param jsdoitCodeId {string} optional
  @param templateParameter {object} optional
  @return {void}
*/
function installAddon(app, global, jsdoitUser, jsdoitCodeId, templateParameter) {
  if(app === undefined) {
    throw "installAddon: requires SpreadsheetApp, DocumentApp or SlidesApp.";
  }
  var ui = app.getUi();
  if(typeof global === "object") {
    installAddonMenu_(ui, global);
  }
  if(typeof jsdoitUser === "string" || typeof jsdoitCodeId === "string") {
    showSidebar_(ui, jsdoitUser, jsdoitCodeId, templateParameter)
  }
}

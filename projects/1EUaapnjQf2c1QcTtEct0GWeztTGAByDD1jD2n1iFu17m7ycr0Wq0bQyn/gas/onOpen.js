function onOpen() {
    SpreadsheetApp.getUi().createAddonMenu()
    .addItem("set this spreadsheet as the default one", "setActiveSpreadsheetAsDefault")
    .addItem("set Glitch login name", "setGlitchLoginName")
    .addItem("fetch Glitch projects", "fetchGlitchProjects")
    .addToUi();
}

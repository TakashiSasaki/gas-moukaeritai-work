function onOpen() {
  SpreadsheetApp.getUi().createAddonMenu()
  .addItem("onOpen", "onOpen")
  .addItem("listGmailLabels", "listGmailLabels")
  .addItem("updateGmailLabel", "updateGmailLabel")
  .addItem("getLastThreadsForLabelIds", "getLastThreadsForLabelIds")
  .addItem("setBackgroundColor", "setBackgroundColor")
  .addToUi();
}

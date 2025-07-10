function onOpen() {
  FormApp.getUi().createAddonMenu()
  .addItem("onOpen", "onOpen")
  .addItem("showNumberOfItems", "showNumberOfItems")
  .addItem("showPublishedUrl", "showPublishedUrl")
  .addItem("showResponseUrl", "showResponseUrl")
  .addItem("showEntries", "showEntries")
  .addItem("postFirstEntry", "postFirstEntry")
  .addItem("deletePageBreaks", "deletePageBreaks")
  .addItem("deleteNonTextQuestions", "deleteNonTextQuestions")
  .addToUi();
}

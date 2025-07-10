function showPublishedUrl() {
  var form = FormApp.getActiveForm();
  var publishedUrl = form.getPublishedUrl();
  var ui = FormApp.getUi();
  ui.alert("published url", publishedUrl, ui.ButtonSet.OK);
}


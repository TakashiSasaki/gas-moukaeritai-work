function showNumberOfItems() {
  var form = FormApp.getActiveForm();
  var items = form.getItems();
  var ui = FormApp.getUi();
  ui.alert("number of items", items.length, ui.ButtonSet.OK);
}

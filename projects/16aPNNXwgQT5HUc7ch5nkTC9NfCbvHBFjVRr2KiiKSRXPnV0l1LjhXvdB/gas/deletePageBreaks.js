function deletePageBreakItems(form) {
  if(form === undefined) {
    form = FormApp.getActiveForm();
  }
  if(form === null) {
    form = getForm_();
  }
  var items = form.getItems();
  for(var i in items) {
    var item =items[i];
    var itemType = item.getType();
    if(itemType == FormApp.ItemType.PAGE_BREAK) {
      form.deleteItem(item);
    }
  }
}

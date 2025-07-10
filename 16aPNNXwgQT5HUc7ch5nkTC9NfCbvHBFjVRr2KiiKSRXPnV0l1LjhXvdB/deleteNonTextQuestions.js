function deleteNonTextItems(){
  var form = FormApp.getActiveForm();
  var items = form.getItems();
  for(var i in items) {
    var item =items[i];
    var itemType = item.getType();
    if(itemType != FormApp.ItemType.TEXT) {
      form.deleteItem(item);
    }
  }  
}
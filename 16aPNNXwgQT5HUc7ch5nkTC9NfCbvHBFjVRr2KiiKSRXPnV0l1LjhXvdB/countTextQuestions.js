function countTextItems() {
  var form = FormApp.getActiveForm();
  var items = form.getItems();
  var count = 0;
  for(var i in items) {
    var item =items[i];
    var itemType = item.getType();
    if(itemType == FormApp.ItemType.TEXT) {
      ++count;
    }
  }
  return count;
}

function showTextItems(){
  
}

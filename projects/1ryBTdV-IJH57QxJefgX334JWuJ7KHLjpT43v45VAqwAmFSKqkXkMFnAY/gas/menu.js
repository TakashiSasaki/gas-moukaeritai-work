/**
  enumerate functions in the global object and put them into add-on menu.
  Functions whose name begin or end with _ are ignored.
  Each function should have title property.
  
  @param global {object}
  @param ui {Ui}
  @return {void}
*/
function installAddonMenu_(ui, global) {
  var functionNames = [];
  var menu = ui.createAddonMenu();

  for(var i in global) {
    var f = global[i];
    if(toString.call(f) !== "[object Function]") continue;
    if(i.match(/_.*/)) continue;
    if(i.match(/.*_^/)) continue;
    if(f.title === undefined) continue;
    menu.addItem(f.title, i);
  }
  menu.addToUi();
}


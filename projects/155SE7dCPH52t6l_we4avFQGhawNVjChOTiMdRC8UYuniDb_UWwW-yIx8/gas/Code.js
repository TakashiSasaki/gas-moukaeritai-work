function onInstall(e){
  onOpen(e);
}

function onOpen(e){
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createAddonMenu();
  menu.addItem("showSidebar", "showSidebar");
  menu.addToUi();
}

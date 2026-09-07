function showSidebar() {
  const htmlTemplate = HtmlService.createTemplateFromFile("sidebar");
  const htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("Google Takeout File Browser");
  SpreadsheetApp.getUi().showSidebar(htmlOutput);

  
}


function onInstall(e){
  onOpen();
}

function onOpen(e){
  SpreadsheetApp.getUi().createAddonMenu().addItem("showSidebar", "showSidebar").addToUi();
  showSidebar();
}

function setGlitchLoginName(){
  var ui = SpreadsheetApp.getUi();
  var promptResponse = ui.prompt("Glithc Login Name");
  if(promptResponse.getSelectedButton() === ui.Button.OK) {
    if(typeof promptResponse.getResponseText() === "string") {
      if(promptResponse.getResponseText().length > 0) {
        userProperties.setProperty("glitchLoginName", promptResponse.getResponseText());
      }
    }
  }
}

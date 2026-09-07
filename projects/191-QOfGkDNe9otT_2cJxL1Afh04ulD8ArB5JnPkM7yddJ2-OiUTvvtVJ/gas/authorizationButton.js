/**
  Create HTML code for authorization button.
  <?!=OAuthLibrary.getAuthorizationButton("authorize!")?>
  @param {String} button_face A string to be shown on the button.
  @return {String} HTML code.
*/
function getAuthorizationButton(button_face) {
  var html_template = HtmlService.createTemplateFromFile("authorizationButtonTemplate");
  html_template.button_face = button_face;
  var html_output = html_template.evaluate();
  var content = html_output.getContent();
  return content;
}

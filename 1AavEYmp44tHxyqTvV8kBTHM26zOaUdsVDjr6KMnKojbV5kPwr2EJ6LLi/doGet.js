function doGet(e) {
  var html_template = HtmlService.createTemplateFromFile("sidebar");
  var html_output = html_template.evaluate();
  html_output.setTitle("Google日本語入力ユーザー辞書ユーティリティ");
  return html_output;
}

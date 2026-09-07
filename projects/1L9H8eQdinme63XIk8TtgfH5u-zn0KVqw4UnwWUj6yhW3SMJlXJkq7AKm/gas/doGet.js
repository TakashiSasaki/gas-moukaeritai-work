function doGet(e) {
  if(e.parameter.url) {
    var product_image_url = getProductImage(e.parameter.url);
    var text_output = ContentService.createTextOutput(product_image_url);
    text_output.setMimeType(ContentService.MimeType.TEXT);
    return text_output;
  } else {
    var html_template = HtmlService.createTemplateFromFile("index");
    var html_output = html_template.evaluate();
    return html_output;
  }
}

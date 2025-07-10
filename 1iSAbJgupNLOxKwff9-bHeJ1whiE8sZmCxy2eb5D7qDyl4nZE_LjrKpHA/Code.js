function doGet() {
  var html_template = HtmlService.createTemplateFromFile("index");
  var html_output = html_template.evaluate();
  return html_output;
}

function saveHostPart(host_part){
  PropertiesService.getUserProperties().setProperty("host_part", host_part);
}

function loadHostPart(){
  var host_part = PropertiesService.getUserProperties().getProperty("host_part");
  Logger.log(host_part);
}

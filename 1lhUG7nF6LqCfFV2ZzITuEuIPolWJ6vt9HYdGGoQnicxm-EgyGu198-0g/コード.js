function doGet() {
  var html_template = HtmlService.createTemplateFromFile("index");
  var html_output = html_template.evaluate();
  html_output.setSandboxMode(HtmlService.SandboxMode.IFRAME);
  html_output.setTitle("松山市プレミアム商品券");
  return html_output;
}

function getCount() {
  var script_property = PropertiesService.getScriptProperties();
  var current_count = parseInt(script_property.getProperty("count"));
  return current_count;
}

function incrementCount(){
  var lock = LockService.getScriptLock();
  lock.waitLock(5000);
  var current_count = getCount();
  var script_property = PropertiesService.getScriptProperties();
  script_property.setProperty("count", ""+(current_count + 1));
  lock.releaseLock();
  return current_count + 1;
}

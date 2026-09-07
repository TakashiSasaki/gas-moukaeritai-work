sandbox = "unknown";

function doGet(e) {
  sandbox = "HtmlService.SandboxMode.NATIVE";
  if(e.parameter.sandbox == "IFRAME") {
    sandbox = "HtmlService.SandboxMode.IFRAME";
  } else if(e.parameter.sandbox == "EMULATED") {
    sandbox = "HtmlService.SandboxMode.EMULATED";
  }
  
  var html_template = HtmlService.createTemplateFromFile("index");
  var html_output = html_template.evaluate();
  html_output.setSandboxMode(HtmlService.SandboxMode.NATIVE);
  if(e.parameter.sandbox == "IFRAME") {
    html_output.setSandboxMode(HtmlService.SandboxMode.IFRAME);
  } else if(e.parameter.sandbox == "EMULATED") {
    html_output.setSandboxMode(HtmlService.SandboxMode.EMULATED);
  }
  html_output.addMetaTag("viewport", "width=device-width,initial-scale=1");
  html_output.setTitle("accessing location object of top window in Google Apps Script");
  return html_output;
}

function count(){
  var counter_string = PropertiesService.getScriptProperties().getProperty("counter_string");
  if(counter_string == null) {
    counter_string = 0;
  }
  var count = Number(counter_string);
  count += 1;
  PropertiesService.getScriptProperties().setProperty("counter_string", count);
  return count;
}

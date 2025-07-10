function doGet(e) {
  if(!e.parameter.user_id) {
    return HtmlService.createHtmlOutputFromFile("readme").setTitle("Automate flow list @TakashiSasaki");
  }
  Logger.log(e.parameter.user_id);
  flows = fetchFlows(e.parameter.user_id);
  if(!e.parameter.format) {
    var html_template = HtmlService.createTemplateFromFile("index");
    var html_output = html_template.evaluate().setTitle("Automate flow list @TakashiSasaki");
    return html_output;
  }
  if(e.parameter.format == "csv") {
    var content = "";
    var separator = ",";
    for(var i=0; i<flows.length; ++i) {
      content += (flows[i]["id"] + separator);
      content += (flows[i]["user"]["id"] + separator);
      content += ("\"" + flows[i]["user"]["name"].replace(/"/g, "\"\"") + "\"" + separator);
      content += (flows[i]["category"]["id"] + separator);
      content += ("\"" + flows[i]["category"]["title"].replace(/"/g, "\"\"") + "\"" + separator);
      content += (flows[i]["category"]["restricted"] + separator);
      content += ("\"" + flows[i]["title"].replace(/"/g, "\"\"")  + "\"" + separator);
      content += ("\"" + flows[i]["description"].replace(/"/g, "\"\"") + "\"" + separator);
      content += (flows[i]["ratings"] + separator);
      content += (flows[i]["featured"] + separator);
      content += ("\"" + getDateTimeString(flows[i]["created"]) + "\"" + separator);
      content += ("\"" + getDateTimeString(flows[i]["modified"]) + "\"" + separator);
      content += (flows[i]["uploadVersion"] + separator);
      content += (flows[i]["dataVersion"] + "\n");
    }
    return ContentService.createTextOutput(content);
  }
  if(e.parameter.format == "json") {
    return ContentService.createTextOutput(JSON.stringify(flows));
  }
  if(e.parameter.format == "chart") {
    return HtmlService.createTemplateFromFile("table").evaluate();
  }
}

function getDateTimeString(epochmill) {
  var d = new Date(epochmill);
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  var date = d.getDate();
  var hour = d.getHours();
  var minute = d.getMinutes();
  var second = d.getSeconds();
  return year + "/" + month + "/" + date + " " + hour + ":" + minute + ":" + second;
}


function fetchFlows(user_id){
  //var flows = CacheService.getUserCache().get(user_id);
  //if(flows) return flows;
  var response = UrlFetchApp.fetch("https://llamalab.com/automate/community/api/v1/users/" + user_id + "/flows");
  var json_string = response.getContentText();
  CacheService.getScriptCache().put(user_id, json_string, 21600);
  return JSON.parse(json_string);
}

function test() {
  var t = (new Date()).getTime();
  Logger.log(getDateTimeString(t));
  var t = 0;
  Logger.log(getDateTimeString(t));
}

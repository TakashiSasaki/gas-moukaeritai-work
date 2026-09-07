function doGet() {
  var html_template = HtmlService.createTemplateFromFile("index");
  var html_output = html_template.evaluate();
  return html_output;
}

function fetchImage(url){
  var result = UrlFetchApp.fetch(url);
  var blob = result.getBlob();
  var content = result.getContent();
  var content_text = result.getContentText();
  return content_text;
}

function postApi(image_base64){
  var api_key = PropertiesService.getScriptProperties().getProperty("ApiKey");
  var url = "https://vision.googleapis.com/v1/images:annotate?key=" + api_key;
  var payload = {
   "requests": [
      {
         "image": {
            "content": image_base64
         },
         "features": [
            {
               "type": "LANDMARK_DETECTION",
               "maxResults": "10"
            },
            {
               "type": "LOGO_DETECTION",
               "maxResults": "10"
            },
            {
               "type": "LABEL_DETECTION",
               "maxResults": "10"
            }
         ]
      }
   ]
  };

  UrlFetchApp.fetch(url, {
   "headers": {"Content-Type":"application/json"},
   "payload" : payload 
  });
}

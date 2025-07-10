function getService_() {
  // Load the service account key JSON
  var serviceAccountKey = JSON.parse(PropertiesService.getScriptProperties().getProperty('SERVICE_ACCOUNT_KEY'));
  var service = OAuth2.createService('NaturalLanguageAPI')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(serviceAccountKey.private_key)
    .setIssuer(serviceAccountKey.client_email)
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope('https://www.googleapis.com/auth/cloud-platform');
  console.log(service);
  return service;
}

function callNaturalLanguageAPI_(text) {
  var service = getService_();
  console.log(service.hasAccess());
  if (service.hasAccess()) {
    var apiEndpoint = 'https://language.googleapis.com/v1/documents:analyzeSentiment';
    var headers = {
      'Authorization': 'Bearer ' + service.getAccessToken(),
      'Content-Type': 'application/json'
    };
    var body = {
      'document': {
        'type': 'PLAIN_TEXT',
        'content': text
      }
    };
    var options = {
      'headers': headers,
      'method': 'post',
      'payload': JSON.stringify(body),
      'muteHttpExceptions': true
    };
    console.log("accessing to the API");
    var response = UrlFetchApp.fetch(apiEndpoint, options);
    var data = JSON.parse(response.getContentText());
    console.log(data);
    return data;
  } else {
    Logger.log(service.getLastError());
  }
}

function analyzeSentiment(text) {
  const saved_sentiment = loadSentiment(text);
  if (saved_sentiment !== null) {
    saveSentiment(saved_sentiment.digest,
      saved_sentiment.score, saved_sentiment.magnitude, saved_sentiment.language);
    return saved_sentiment;
  }
  const result = callNaturalLanguageAPI_(text);
  const score = result.documentSentiment.score;
  const magnitude = result.documentSentiment.magnitude;
  const language = result.language;
  console.log(score, magnitude, language);
  saveSentiment(text, score, magnitude, language);
  return loadSentiment(text);
}

function testAnalyzeSentiment() {
  console.log(analyzeSentiment("あ～あ～。今日は疲れたなぁ。もういやだなぁ。"));
}
// callGeminiAPI.gs
// Sends a POST request to Gemini API using Google Apps Script

function callGeminiAPI(payload) {
  if (payload === undefined) {
    payload = {
      contents: [
        {
          parts: [
            {
              text: '日本の挨拶について詳しく教えてください'
            }
          ]
        }
      ]
    };
  }
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const MODEL_ID = "gemma-3-27b-it"
  //const MODEL_ID = "gemini-2.0-flash-lite"
  //const MODEL_ID  = "gemini-2.0-flash"
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=` + apiKey;



  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true // to log error responses if any
  };

  const response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getContentText());
}

function testGetTitle(){
  const text = "\
    今日はいい天気ですね。\
    そうですね。\
    カレーライスを食べたいですね。\
    いやです。\
  "
  const payload = {
      contents: [
        {
          parts: [
            {
              text: `本文を読んでタイトルを付けてください。出力はJSONオブジェクトだけを含むプレーンテキストで {"title":"an inferred title"} の形式で出力してください。以下本文が続きます。\n\n本文:\n${text}`
            }
          ]
        }
      ]
  }
  callGeminiAPI(payload);
}
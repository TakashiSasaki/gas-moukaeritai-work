// ==========================================
// Gemini.gs
// Gemini API の操作（モデル選択・グラウンディング・堅牢抽出・指示完全復元版）
// ==========================================

function generateFacilityHtml(targetPrompt) {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty("GEMINI_API_KEY");
  
  // スクリプトプロパティからモデル名を取得。なければデフォルト。
  const selectedModel = props.getProperty("SELECTED_MODEL") || DEFAULT_MODEL;
  
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

  const today = new Date();
  const formattedDate = Utilities.formatDate(today, "JST", "yyyy年MM月dd日");

  const contents = [
    {
      "role": "user",
      "parts": [{ "text": targetPrompt }]
    }
  ];

  const payload = {
    "systemInstruction": {
      "parts": [
        {
          "text": `あなたは提供されたURLや検索結果から最新の展示スケジュール情報を正確に読み取り、整理された静的なHTMLを出力する専門家です。本日は ${formattedDate} です。\n\n【厳守ルール】\n1. JavaScriptによるデータの動的取得コード(fetch等)やスクレイピングのコードは一切含めないでください。データはあなたが読み取った内容を直接HTMLテキストとして書き込んでください。ローディング表示などは不要です。\n2. 抽出する情報は、本日（${formattedDate}）を含む、あるいはそれ以降に開催される現在および今後のイベントに限定してください。すでに終了した過去のイベントは除外します。\n3. デザインはCSS(@media対応)を用いて、スマートフォンの縦長の画面にも対応するようにレスポンシブな設計にしてください。配色には、情報源として使用した各施設のウェブサイトのテーマカラーやアクセントカラーを使用してください。\n4. 各イベント名には、その情報の根拠となったURLへのクリッカブルなリンクを必ず設定してください。また、施設の公式なウェブサイトへのリンクをヘッダとフッタに必ず含めてください。\n5. 推測を排除し、情報源に明記されている事実のみを反映してください。`
        }
      ]
    },
    "tools": [
      {
        "google_search": {} 
      }
    ],
    "contents": contents,
    "generationConfig": {
      "temperature": 0.2,
      "topP": 0.95,
      "topK": 40,
      "maxOutputTokens": 20000
    }
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  const response = UrlFetchApp.fetch(endpoint, options);
  const result = JSON.parse(response.getContentText());
  
  if (result.error) {
    throw new Error("Gemini API Error: " + result.error.message);
  }

  const candidate = result.candidates[0];
  const parts = candidate.content.parts;
  let rawResponseText = parts[parts.length - 1].text;
  
  const startIndex = rawResponseText.search(/<!DOCTYPE html>|<html/i);
  if (startIndex !== -1) {
    const endIndex = rawResponseText.search(/<\/html>/i);
    if (endIndex !== -1) {
      return rawResponseText.substring(startIndex, endIndex + 7);
    } else {
      return rawResponseText.substring(startIndex);
    }
  } else {
    return rawResponseText.replace(/^```(html)?\n?/gm, '').replace(/```$/gm, '').trim();
  }
}
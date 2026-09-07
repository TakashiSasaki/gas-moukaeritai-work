/**
 * Filename: generateTitleFromMarkdown.gs
 * 
 * Generates a concise title from the Markdown content using Gemma 3 27B (Gemini API).
 *
 * @param {string} markdown - The Markdown text from which to generate a title.
 * @return {string} - The generated title.
 */
function generateTitleFromMarkdown(markdown) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const modelId = 'gemma-3-27b-it';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  // Prepare the prompt by separating the instruction from the content clearly.
  const prompt = `Please read the following Markdown content and generate a concise and descriptive title that accurately reflects its content. ` +
                 `Output a plain text JSON object only in the format {"title":"..."}.\n\nContent:\n${markdown}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseText = response.getContentText();
  Logger.log("Raw Response: " + responseText);

  try {
    // Extract the candidate text
    const candidates = JSON.parse(responseText).candidates;
    if (candidates && candidates.length > 0) {
      let partText = candidates[0].content.parts[0].text;
      Logger.log("Extracted Text (raw): " + partText);

      // Extract only the JSON string from the response using helper function.
      partText = extractJsonString(partText);
      Logger.log("Extracted JSON String: " + partText);

      const jsonResult = JSON.parse(partText); // Expecting {"title": "..."}
      return jsonResult.title || "Markdown2Docs Output";
    }
  } catch (e) {
    Logger.log("Error parsing response: " + e);
  }

  return "Markdown2Docs Output"; // fallback in case of error
}

/**
 * Extracts the JSON substring from a text that may contain extra unwanted characters.
 *
 * This function locates the first occurrence of '{' and the last occurrence of '}'
 * and returns the substring between them (inclusive), which is expected to be a valid JSON.
 *
 * @param {string} text - The raw text containing a JSON string.
 * @return {string} - The extracted JSON string, or the original text if extraction fails.
 */
function extractJsonString(text) {
  const firstIndex = text.indexOf('{');
  const lastIndex = text.lastIndexOf('}');
  if (firstIndex !== -1 && lastIndex !== -1 && lastIndex > firstIndex) {
    return text.substring(firstIndex, lastIndex + 1);
  }
  return text;
}

/**
 * 単体テスト: generateTitleFromMarkdown 関数の動作確認用テスト関数。
 * サンプルの Markdown テキストを用いてタイトルを生成し、ログ出力します。
 */
function testGenerateTitleFromMarkdown() {
  const sampleMarkdown = `
# はじめに

これはMarkdownのサンプルです。いくつかの段落とリストを含んでいます。

## 特徴

- シンプルな構造
- Gemini API によるタイトル生成
- GASとの連携

## おわりに

お試しいただきありがとうございます。
`;

  const generatedTitle = generateTitleFromMarkdown(sampleMarkdown);
  Logger.log("Generated Title: " + generatedTitle);
}

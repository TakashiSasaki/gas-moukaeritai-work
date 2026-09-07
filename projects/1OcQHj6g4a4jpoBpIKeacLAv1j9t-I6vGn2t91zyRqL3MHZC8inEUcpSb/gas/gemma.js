// File: gemma.gs
// Description: Google Apps Script for calling Gemma 3 (gemma-3-27b-it) with prompt engineering to simulate structured JSON output.

/**
 * Generates an IME user dictionary using Gemini 3 with prompt instructions to enforce JSON schema.
 *
 * @param {(string|string[])} userInput - A single string or an array of strings representing the user input.
 * @returns {Object[]} Array of parsed dictionary entry objects.
 * @throws {Error} If the API key is not set, if the API call fails, or if parsing fails.
 */
function gemma(userInput) {
  assertLockAndRateLimit();
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('API key is not set in Script Properties.');
  }

  // Build the prompt
  const promptText =
    'You are a JSON generator for IME user dictionaries.\n' +
    'Input: <ユーザーからの日本語テキストやCSV/TSV/二次元JSON配列>.\n\n' +
    '**Instructions**:\n' +
    '1. Parse each line or JSON row as one entry.\n' +
    '2. Ensure **reading** is entirely in hiragana.\n' +
    '3. For the **word** field, copy the input string exactly as-is; do not translate or modify it.\n' +
    '4. If **partOfSpeech** is missing, infer the most appropriate POS tag from this list:\n' +
    '   [名詞, 地名, 人名, 姓, 名, 短縮よみ, 顔文字,\n' +
    '    さ変形動名詞, 固有名詞, 形容詞, 形容動詞, 副詞,\n' +
    '    連体詞, 接続詞, 感動詞, 慣用句, さ変名詞, ざ変名詞,\n' +
    '    形動名詞, 副詞的名詞, 接頭語, 姓名接頭語, 地名接頭語,\n' +
    '    接尾語, 人名接尾語, 地名接尾語, 助数詞,\n' +
    '    あわ行五段, か行五段, が行五段, さ行五段, た行五段,\n' +
    '    な行五段, ば行五段, ま行五段, ら行五段, 一段動詞]  \n' +
    '5. If **locale** is missing, infer it (e.g. "ja-JP").\n' +
    '6. Output **only** a JSON array of objects with these fields:\n' +
    '   - reading (string, hiragana)\n' +
    '   - word (string, exactly as input)\n' +
    '   - partOfSpeech (string from the list above)\n' +
    '   - locale (string)\n' +
    '   - comment (optional string)\n' +
    '7. Do **not** include any extra text—no explanation, no markdown fences, only raw JSON.\n\n' +
    'Now generate the JSON for the following input:';

  // Prepare the input text
  const inputText = Array.isArray(userInput) ? userInput.join('\n') : userInput;

  // Build the request payload
  const data = {
    generationConfig: {
      temperature: 0.9,
      topP: 1,
      topK: 10,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain'
    },
    contents: [
      { role: 'user', parts: [{ text: promptText }] },
      { role: 'user', parts: [{ text: inputText }] }
    ]
  };

  // Call the Gemini 3 API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`;
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(data),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  const text = response.getContentText();
  if (code !== 200) {
    throw new Error(`Gemini API returned status ${code}: ${text}`);
  }

  // Parse the API response wrapper
  let wrapper;
  try {
    wrapper = JSON.parse(text);
  } catch (e) {
    throw new Error('Failed to parse API response JSON: ' + e.message);
  }

  // Validate candidates
  if (!wrapper.candidates || !Array.isArray(wrapper.candidates) || wrapper.candidates.length === 0) {
    throw new Error('API response contains no candidates');
  }
  const candidate = wrapper.candidates[0];
  if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
    throw new Error('API response candidate has no content parts');
  }

  // Extract and clean JSON text
  let jsonText = candidate.content.parts[0].text;
  if (typeof jsonText !== 'string') {
    throw new Error('API response content part text is not a string');
  }
  jsonText = jsonText.trim();
  // Remove markdown fences or leading language markers
  jsonText = jsonText.replace(/^```json\s*/, '').replace(/^```\s*/, '');
  jsonText = jsonText.replace(/```$/, '');
  jsonText = jsonText.replace(/^json\s*/, '');

  // Parse entries array
  let entries;
  try {
    entries = JSON.parse(jsonText);
  } catch (e) {
    throw new Error('Failed to parse JSON entries: ' + e.message + ' | Content: ' + jsonText);
  }

  if (!Array.isArray(entries)) {
    throw new Error('Parsed entries is not an array');
  }

  return entries;
}

/**
 * Test function for gemma().
 * Invokes gemma(), expects an array of entry objects, and performs validation.
 */
function testGemma() {
  const lines = ['とうきょう,東京', 'しゃかい,社会,名詞'];
  const rawInput = lines.join('\n');

  try {
    const entries = gemma(rawInput);
    Logger.log('Parsed entries: ' + JSON.stringify(entries, null, 2));

    if (!Array.isArray(entries)) {
      throw new Error('Expected an array of entries, got ' + typeof entries);
    }
    entries.forEach((entry, idx) => {
      if (!entry.reading || !/^[ぁ-ん]+$/.test(entry.reading)) {
        throw new Error(`Entry ${idx} has invalid reading: ${entry.reading}`);
      }
      if (!entry.partOfSpeech) {
        throw new Error(`Entry ${idx} missing partOfSpeech`);
      }
      if (!entry.locale) {
        throw new Error(`Entry ${idx} missing locale`);
      }
    });
    Logger.log('All tests passed successfully.');
  } catch (err) {
    Logger.log('Test failed: ' + err.message);
  }
}
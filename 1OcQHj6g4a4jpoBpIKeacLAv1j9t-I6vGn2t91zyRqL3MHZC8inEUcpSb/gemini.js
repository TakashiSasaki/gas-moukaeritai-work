// File: gemini.gs
// Description: Google Apps Script for calling the Gemini API from a web app

/**
 * Generates an IME user dictionary using the Gemini API.
 * Parses the API response and returns an array of entry objects.
 *
 * @param {(string|string[])} userInput - A single string or an array of strings representing the user input.
 * @returns {Object[]} Array of parsed dictionary entry objects.
 * @throws {Error} If the API key is not set, if the API call fails, or if parsing fails.
 */
function gemini(userInput) {
  assertLockAndRateLimit();

  // Retrieve the API key
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('API key is not set in Script Properties.');
  }

  // Gemini 2.0 Flash generation config
  const generationConfig = {
    temperature: 0.2,
    topP: 0.97,
    topK: 10,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'array',
      items: {
        type: 'object',
        required: ['reading', 'word', 'partOfSpeech', 'locale'],
        properties: {
          reading: { type: 'string', pattern: '^(?:[ぁ-んゔ]+|[a-z]+)$' },
          word: { type: 'string' },
          partOfSpeech: { type: 'string', enum: Array.from({ length: 39 }, (_, i) => _getPartOfSpeech(i)) },
          locale: { type: 'string' },
          comment: { type: 'string' }
        }
      }
    }
  };

  // Build contents
  const contents = Array.isArray(userInput)
    ? userInput.map(text => ({ role: 'user', parts: [{ text: text }] }))
    : [{ role: 'user', parts: [{ text: userInput }] }];

  const data = { generationConfig, contents, systemInstruction: { role: 'user', parts: [{ text: 'Generate IME JSON...' }] } };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(data), muteHttpExceptions: true };

  // Call API
  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  const text = response.getContentText();
  if (code !== 200) {
    throw new Error(`Gemini API returned status ${code}: ${text}`);
  }

  // Parse wrapper
  let wrapper;
  try {
    wrapper = JSON.parse(text);
  } catch (e) {
    throw new Error('Failed to parse API JSON: ' + e.message);
  }

  // Validate
  if (!wrapper.candidates || !Array.isArray(wrapper.candidates) || wrapper.candidates.length === 0) {
    throw new Error('API response has no candidates');
  }
  const candidate = wrapper.candidates[0];
  if (!candidate.content || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
    throw new Error('API response candidate has no parts');
  }

  // Extract JSON text
  let jsonText = candidate.content.parts[0].text;
  if (typeof jsonText !== 'string') {
    throw new Error('Content part text is not a string');
  }
  jsonText = jsonText.trim()
    .replace(/^```json\s*/, '')
    .replace(/^```\s*/, '')
    .replace(/```$/, '')
    .replace(/^json\s*/, '');

  // Parse entries
  let entries;
  try {
    entries = JSON.parse(jsonText);
  } catch (e) {
    throw new Error('Failed to parse entries JSON: ' + e.message + ' | ' + jsonText);
  }
  if (!Array.isArray(entries)) {
    throw new Error('Parsed entries is not an array');
  }

  return entries;
}

/**
 * Test function for gemini().
 * Calls gemini() and validates returned entries.
 */
function testGemini() {
  const lines = ['とうきょう,東京', 'しゃかい,社会,名詞'];
  const raw = lines.join('\n');
  try {
    const entries = gemini(raw);
    Logger.log('Entries: ' + JSON.stringify(entries, null, 2));

    if (!Array.isArray(entries)) {
      throw new Error('Expected array, got ' + typeof entries);
    }

    entries.forEach((e, i) => {
      if (!e.reading || !/^[ぁ-んゔ]+$/.test(e.reading)) {
        throw new Error(`Entry ${i} invalid reading: ${e.reading}`);
      }
      if (!e.partOfSpeech) {
        throw new Error(`Entry ${i} missing partOfSpeech`);
      }
      if (!e.locale) {
        throw new Error(`Entry ${i} missing locale`);
      }
    });
    Logger.log('testGemini passed');
  } catch (err) {
    Logger.log('testGemini failed: ' + err.message);
  }
}

function _getPartOfSpeech(id) {
  const labels = ['名詞','地名','人名','姓','名','短縮よみ','顔文字','さ変形動名詞','固有名詞','形容詞','形容動詞','副詞','連体詞','接続詞','感動詞','慣用句','さ変名詞','ざ変名詞','形動名詞','副詞的名詞','接頭語','姓名接頭語','地名接頭語','接尾語','人名接尾語','地名接尾語','助数詞','あわ行五段','か行五段','が行五段','さ行五段','た行五段','な行五段','ば行五段','ま行五段','ら行五段','一段動詞'];
  return labels[id] || `Unknown(${id})`;
}

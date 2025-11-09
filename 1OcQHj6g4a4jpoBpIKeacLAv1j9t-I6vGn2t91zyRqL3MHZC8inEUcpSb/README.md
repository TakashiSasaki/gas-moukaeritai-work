# Project: 1OcQHj6g4a4jpoBpIKeacLAv1j9t-I6vGn2t91zyRqL3MHZC8inEUcpSb

## Project Overview and Purpose

This Google Apps Script project, likely named "ImeDictionary" or similar, is a web application designed to generate IME (Input Method Editor) user dictionaries. It leverages Google's Gemini API (specifically Gemma 3 and Gemini 2.0 Flash models) to process user input (TSV, CSV, or plain text) and output structured JSON data suitable for IME dictionaries. The application includes robust rate limiting and locking mechanisms to manage API calls and ensures data consistency. It provides an interactive web interface for users to input data, generate intermediate states, and view the final JSON output.

## Core Functionality

The project's core functionality revolves around processing user input with AI models to generate structured dictionary data.

### AI Integration (`gemini.js`, `gemma.js`)

The project integrates with two different Gemini models for dictionary generation.

*   **`gemini(userInput)`**: Calls the `gemini-2.0-flash` model. It expects user input (string or array of strings) and returns an array of parsed dictionary entry objects. It uses a `generationConfig` to enforce a specific JSON schema for the output, including fields like `reading`, `word`, `partOfSpeech`, and `locale`.
*   **`gemma(userInput)`**: Calls the `gemma-3-27b-it` model. It uses prompt engineering to instruct the model to output JSON data, ensuring hiragana readings, exact word copying, inferred parts of speech, and locale.

```javascript
// Excerpt from gemini.js
function gemini(userInput) {
  assertLockAndRateLimit(); // Ensures rate limits are respected

  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  // ... (API key validation) ...

  const generationConfig = {
    temperature: 0.2,
    topP: 0.97,
    topK: 10,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
    responseSchema: { /* ... schema definition ... */ }
  };

  const contents = Array.isArray(userInput)
    ? userInput.map(text => ({ role: 'user', parts: [{ text: text }] }))
    : [{ role: 'user', parts: [{ text: userInput }] }];

  const data = { generationConfig, contents, systemInstruction: { role: 'user', parts: [{ text: 'Generate IME JSON...' }] } };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const options = { method: 'post', contentType: 'application/json', payload: JSON.stringify(data), muteHttpExceptions: true };

  const response = UrlFetchApp.fetch(url, options);
  // ... (response parsing and error handling) ...
  return entries;
}

// Excerpt from gemma.js
function gemma(userInput) {
  assertLockAndRateLimit();
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  // ... (API key validation) ...

  const promptText =
    'You are a JSON generator for IME user dictionaries.\n' +
    'Input: <ユーザーからの日本語テキストやCSV/TSV/二次元JSON配列>.\n\n' +
    '**Instructions**:\n' +
    // ... (detailed instructions for JSON generation) ...
    'Now generate the JSON for the following input:';

  const inputText = Array.isArray(userInput) ? userInput.join('\n') : userInput;

  const data = { /* ... generationConfig and contents ... */ };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`;
  const options = { /* ... request options ... */ };

  const response = UrlFetchApp.fetch(url, options);
  // ... (response parsing and error handling) ...
  return entries;
}
```

### Data Processing (`_extractTable.js`)

*   **`_extractTable(inputText)`**: This function processes raw input text. It splits the text into lines and, for lines containing a hard tab (`	`), it splits the line by the tab character, effectively extracting tabular data. This serves as an intermediate step before AI processing.

```javascript
function _extractTable(inputText) {
  var lines = inputText.split(/\r?\n/);
  var table = [];
  
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('\t') !== -1) {
      table.push(lines[i].split('\t'));
    }
  }
  return table;
}
```

### Rate Limiting and Locking (`assertLockAndRateLimit.js`, `isRateLimited.js`)

The project includes mechanisms to prevent excessive API calls and ensure script execution integrity.

*   **`assertLockAndRateLimit(customKey, customDuration, customLimit)`**: Acquires a script-wide lock and checks if the current API call is within the defined rate limits. It increments a counter in the script cache and throws an error if the limit is exceeded. Configuration values can be provided as arguments or retrieved from script properties.
*   **`isRateLimited()`**: Checks if the rate limit has already been exceeded without attempting to increment the counter.

```javascript
// Excerpt from assertLockAndRateLimit.js
function assertLockAndRateLimit(customKey, customDuration, customLimit) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) {
    throw new Error('Script is currently locked. Try again later.');
  }
  try {
    const props = PropertiesService.getScriptProperties();
    const key = customKey != null ? customKey : props.getProperty('BISHOP_KEY_NAME');
    const duration = parseInt(durationStr, 10);
    const limit = parseInt(limitStr, 10);
    const cache = CacheService.getScriptCache();
    let currentCount = cache.get(key);
    // ... (logic to increment count and check limit) ...
    cache.put(key, String(currentCount), duration);
  } finally {
    lock.releaseLock();
  }
}
```

### Web App Entry Point (`doGet.js`)

*   **`doGet()`**: This function serves as the entry point for the web application, rendering the `index.html` file.

```javascript
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}
```

## Web Interface

The project's web interface is defined in `index.html`.

### `index.html`

This HTML file provides an interactive user interface for the IME dictionary generation:

*   **API Selector:** A dropdown to choose between "Gemma 3" and "Gemini 2.0 Flash" models.
*   **User Input Area:** A `textarea` for users to paste or type TSV data for the IME user dictionary.
*   **Intermediate State Panel:** A collapsible panel that displays the output of `_extractTable` (the processed tabular data from user input). It includes a "Generate Intermediate State" button.
*   **Final Output Panel:** A collapsible panel that displays the final JSON output generated by the selected Gemini API. It includes a "Generate Final Output" button and a "Copy" button to copy the JSON to the clipboard.
*   **Client-side Logic:** JavaScript handles dynamic panel toggling, calling server-side functions (`_extractTable`, `gemini`, `gemma`) using `google.script.run`, and updating the UI with results and error messages. It also includes a `blur` event listener on the input area to automatically generate the intermediate state.

## Permissions

The `appsscript.json` manifest file specifies the following permissions and access settings:

*   **Time Zone:** `Asia/Tokyo`
*   **Exception Logging:** `STACKDRIVER`
*   **Runtime Version:** `V8`
*   **Web App Access:** `ANYONE_ANONYMOUS` - The web application is accessible by anyone, even without a Google account.
*   **Web App Execution:** `USER_DEPLOYING` - The script runs under the identity of the user who deployed the web app. This is necessary for making `UrlFetchApp` calls to the Gemini API.

## Configuration

*   **`GEMINI_API_KEY`**: A Google Gemini API key must be set as a script property (`PropertiesService.getScriptProperties()`) for the AI functions to work.
*   **Rate Limiting Properties**: `BISHOP_KEY_NAME`, `DURATION_SECOND`, and `LIMIT_IN_DURATION` are script properties used to configure the rate limiting mechanism.

## Deployments

The project has the following deployments:

*   **Deployment ID:** `AKfycbx_zx3KiuEBvEg49Ecj1ybt33u5hMOhGXhOmB0uFnyX`
    *   **Target Version:** `HEAD`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbx_zx3KiuEBvEg49Ecj1ybt33u5hMOhGXhOmB0uFnyX/exec`

*   **Deployment ID:** `AKfycbwUI7B7lXtXmwFR2yHaP-z7BPnqRmkssL3VJ8QGnNeInvDvp_ILuUkYDQy5GThUrL7XFQ`
    *   **Target Version:** `1`
    *   **Description:** `initial commit`
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbwUI7B7lXtXmwFR2yHaP-z7BPnqRmkssL3VJ8QGnNeInvDvp_ILuUkYDQy5GThUrL7XFQ/exec`

*   **Deployment ID:** `AKfycbww8l73UVR8Xb_W1-GArwpPVcVoflk0vEthE0kdE4uPVcxDuOC-gLHhYKOrDHXHwWKT9Q`
    *   **Target Version:** `2`
    *   **Description**: `ライブラリとして使えるレベルになった` (Became usable as a library)
    *   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbww8l73UVR8Xb_W1-GArwpPVcVoflk0vEthE0kdE4uPVcxDuOC-gLHhYKOrDHXHwWKT9Q/exec)
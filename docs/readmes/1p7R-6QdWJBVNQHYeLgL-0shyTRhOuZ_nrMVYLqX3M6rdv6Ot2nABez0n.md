# Project: 1p7R-6QdWJBVNQHYeLgL-0shyTRhOuZ_nrMVYLqX3M6rdv6Ot2nABez0n

## Project Overview and Purpose

This Google Apps Script project is a web application designed to interact with the Pocket API, allowing users to authorize their Pocket account and fetch their saved items (bookmarks). The application provides a user interface to filter and sort Pocket items based on various criteria such as state (unread, archive, all), favorite status, tags, content type, and more. It handles the OAuth authorization flow for Pocket and displays the fetched items, along with debug information about the API response.

## Core Functionality

The project's core functionality revolves around Pocket API integration and user interface for managing bookmarks.

### Pocket API Authorization and Data Fetching (`Code.js`, `fetchPocketItems.js`)

*   **`doGet(e)` (in `Code.js`)**: This is the web application's entry point. It checks for an existing `ACCESS_TOKEN` in user properties. If not found, it initiates the Pocket OAuth flow by generating an authorization URL. If an `ACCESS_TOKEN` exists, it serves `index.html`.
*   **`generateAuthorizationUrl()` (in `Code.js`)**: Constructs the Pocket authorization URL, which includes a `requestToken` obtained from Pocket and a callback URL for the script.
*   **`getRequestToken()` (in `Code.js`)**: Makes a POST request to the Pocket API to obtain a `requestToken`, which is the first step in the OAuth process. It uses `UrlFetchApp` and logs the response for debugging.
*   **`getAccessToken(requestToken)` (in `Code.js`)**: Exchanges the `requestToken` for an `ACCESS_TOKEN` after the user has authorized the application. This `ACCESS_TOKEN` is then saved in user properties for future use.
*   **`authCallback(e)` (in `Code.js`)**: Handles the callback from Pocket after user authorization. It extracts the `requestToken` from the event parameters, converts it to an `ACCESS_TOKEN`, saves it, and then displays `index.html`.
*   **`fetchPocketItems(options)` (in `fetchPocketItems.js`)**: Fetches items from the Pocket API using the stored `ACCESS_TOKEN`. It accepts an `options` object to customize the API request (e.g., `state`, `count`, `detailType`). The raw API response is cached in user properties.
*   **`getRawResponse()` (in `fetchPocketItems.js`)**: Retrieves the raw Pocket API response from user properties, primarily for debugging purposes.

```javascript
// Excerpt from Code.js - doGet function
function doGet(e) {
  const userProperties = PropertiesService.getUserProperties();
  const accessToken = userProperties.getProperty('ACCESS_TOKEN');

  if (!accessToken) {
    const authorizationUrl = generateAuthorizationUrl();
    const html = HtmlService.createHtmlOutput(`<a href="${authorizationUrl}" target="_blank">Click here to authorize Pocket</a>`);
    return html;
  } else {
    return HtmlService.createTemplateFromFile('index').evaluate()
      .setTitle('Pocket Bookmarks')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

// Excerpt from fetchPocketItems.js - fetchPocketItems function
function fetchPocketItems(options = {}) {
  const userProperties = PropertiesService.getUserProperties();
  const accessToken = userProperties.getProperty('ACCESS_TOKEN');

  if (!accessToken) {
    throw new Error('Access token is missing.');
  }

  const url = 'https://getpocket.com/v3/get';
  const defaultOptions = {
    consumer_key: CONSUMER_KEY, // CONSUMER_KEY is from script properties
    access_token: accessToken,
    count: 10,
    detailType: 'complete',
  };
  const payload = Object.assign(defaultOptions, options);

  const requestOptions = {
    method: 'post',
    headers: { 'Content-Type': 'application/json; charset=UTF-8', 'X-Accept': 'application/json' },
    payload: JSON.stringify(payload),
  };

  try {
    const response = UrlFetchApp.fetch(url, requestOptions);
    const responseText = response.getContentText();
    userProperties.setProperty('POCKET_RAW_RESPONSE', responseText);
    const data = JSON.parse(responseText);
    const items = Object.values(data.list);
    return items;
  } catch (error) {
    Logger.log('Error fetching items: ' + error.message);
    throw new Error('Failed to fetch Pocket items.');
  }
}
```

### Utility Functions (`Code.js`)

*   **`getCallbackURL(callbackFunction, params)`**: Generates a callback URL for Google Apps Script's `ScriptApp.newStateToken()` mechanism, allowing the script to handle redirects and pass parameters.
*   **`parseFormUrlEncoded(text)`**: Parses a URL-encoded string (e.g., `key1=value1&key2=value2`) into a JavaScript object.

## Web Interface

The project's web interface is defined in `index.html` and `script.html`.

### `index.html`

This HTML file provides the main user interface for interacting with Pocket:

*   **Parameter Setting Form:** A flexible form with various input fields and dropdowns to set parameters for fetching Pocket items (e.g., `state`, `favorite`, `tag`, `contentType`, `sort`, `detailType`, `search`, `domain`, `year`, `month`, `since`, `count`, `offset`, `total`).
*   **"Fetch Items" Button:** Triggers the `loadPocketItems()` JavaScript function.
*   **Item List (`itemList`)**: Displays the fetched Pocket items as a list of links.
*   **Item Count and Timestamps:** Shows the number of fetched items and the oldest/newest timestamps among them.
*   **Debug Output Section:** Includes a `textarea` to display the raw JSON response from the Pocket API and provides debug information like item count, byte size, and character count of the raw data.
*   **Dynamic Year Options:** The `year` dropdown is dynamically populated with years from 2000 to the current year using JavaScript.

### `script.html`

This HTML file contains the client-side JavaScript logic for the web interface:

*   **`populateYearOptions()`**: Populates the year dropdown in `index.html`.
*   **`updateTimestamp()`**: Updates the `since` (Unix timestamp) input field based on the selected year and month.
*   **`loadPocketItems()`**: Gathers parameters from the form, calls the server-side `fetchPocketItems()` function using `google.script.run`, and passes the fetched items to `displayItems()`.
*   **`displayItems(items)`**: Renders the fetched Pocket items in the `itemList`, calculates and displays the total item count, and the oldest/newest timestamps.
*   **`loadDebugData()`**: Calls the server-side `getRawResponse()` function to retrieve and display the raw API response in the debug textarea.
*   **`displayRawData(rawData)`**: Parses and displays the raw JSON response, including item count, byte size, character count, and timestamps from the raw data.

## Permissions

The `appsscript.json` manifest file specifies the following permissions and access settings:

*   **Time Zone:** `Asia/Tokyo`
*   **Exception Logging:** `STACKDRIVER`
*   **Runtime Version:** `V8`
*   **Dependencies:** No external libraries are explicitly listed in `appsscript.json`.
*   **Web App Access:** `MYSELF` - The web application is accessible only by the user who deployed it. This is a security measure, as it handles sensitive user data (Pocket access tokens).
*   **Web App Execution:** `USER_DEPLOYING` - The script runs under the identity of the user who deployed the web app. This is necessary for accessing user properties and making `UrlFetchApp` calls to the Pocket API.

## Configuration

*   **`CONSUMER_KEY`**: A Pocket API Consumer Key must be set as a script property (`PropertiesService.getScriptProperties()`) for the application to function.
*   **`ACCESS_TOKEN`**: The user's Pocket access token is stored in user properties (`PropertiesService.getUserProperties()`) after successful authorization.
*   **`POCKET_RAW_RESPONSE`**: The raw JSON response from the Pocket API is cached in user properties for debugging.

## Deployments

The project has the following deployments:

*   **Deployment ID:** `AKfycbyn2ggsYDyhNj6RJ-aJRbE6qjvijvtRe5nkIoXu-R4`
    *   **Target Version:** `HEAD`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbyn2ggsYDyhNj6RJ-aJRbE6qjvijvtRe5nkIoXu-R4/exec`

*   **Deployment ID:** `AKfycbyBD73dWM5lqWyd1h0C3oOQlfgXwrTfnOQPUDg0Tqiywq5AZ6PIr6stbCnDrpk3c5Jp`
    *   **Target Version:** `7`
    *   **Description:** `Pocketで認可してアイテムを取得できるところまで確認` (Confirmed up to authorizing with Pocket and fetching items)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbyBD73dWM5lqWyd1h0C3oOQlfgXwrTfnOQPUDg0Tqiywq5AZ6PIr6stbCnDrpk3c5Jp/exec`

# Google Apps Script Project Browser

## Overview

This Google Apps Script project, "Google Apps Script Project Browser," is a web app designed to browse Google Apps Script projects. It includes an OAuth2 flow to authorize access to the user's projects. The project appears to be incomplete, as some of its core functionality is not implemented.

## Functionality

The web app provides a user interface with an authorization flow. When a user visits the web app, it generates an authorization URL. After the user authorizes the app, it retrieves an access token and refresh token.

### Core Features

- **`doGet(e)`:** The main entry point for the web app. It creates and displays the main HTML page, which includes an authorization link.
- **`createAuthorizationUrl()`:** Generates the URL for the OAuth2 consent screen, requesting the `https://www.googleapis.com/auth/script.projects` scope.
- **`getToken(e)`:** The callback function for the OAuth2 flow. It exchanges the authorization code for an access token and refresh token and stores them in `UserProperties`.
- **Incomplete Features:** The `getProcessList.js` and `getStandaloneScripts.js` files are present but do not contain any functional code.

### Code Examples

#### `doGet.js`
```javascript
function doGet(e) {
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  htmlTemplate.authorizationUrl = createAuthorizationUrl();
  if(SpreadsheetApp.getActiveSpreadsheet() !== null){
    htmlTemplate.activeSpreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  } else {
    htmlTemplate.activeSpreadsheetId = "";
  }
  var htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("Google Apps Script Project Browser");
  return htmlOutput;
}//doGet
```

#### `getToken(e)`
```javascript
function getToken(e){
  // ... (OAuth2 token exchange logic)
  var accessToken = JSON.parse(json).access_token;
  var refreshToken = JSON.parse(json).refresh_token;
  var expires_in = JSON.parse(json).expires_in;
  var expiresAt = (new Date()).getTime() + expires_in * 1000;
  PropertiesService.getUserProperties().setProperty("accessToken", accessToken);
  PropertiesService.getUserProperties().setProperty("refreshToken", refreshToken);
  PropertiesService.getUserProperties().setProperty("expiresAt", expiresAt);
  // ...
}//getToken
```

## Permissions

The `appsscript.json` file specifies that the web app is accessible to anyone and executes as the user accessing the app. This is necessary for the OAuth2 flow to work correctly for each user.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
  },
  "webapp": {
    "access": "ANYONE",
    "executeAs": "USER_ACCESSING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Configuration

This project requires a `CLIENT_ID` and `CLIENT_SECRET` to be configured in `ScriptProperties` for the OAuth2 flow to work.

## Deployments

The project has two deployments:

- **ID (HEAD):** `AKfycbydTvvCh6BhKQWPX5XYU0baBLb5BOuhDaSIvirVjsC1`
  - **URL:** `https://script.google.com/macros/s/AKfycbydTvvCh6BhKQWPX5XYU0baBLb5BOuhDaSIvirVjsC1/exec`
- **ID (Version 2):** `AKfycbwQJNC35zwtEUGqnoQRwNQX-ALYtMHOQMw7Hz0BGFOIgyF1H4t3`
  - **URL:** `https://script.google.com/macros/s/AKfycbwQJNC35zwtEUGqnoQRwNQX-ALYtMHOQMw7Hz0BGFOIgyF1H4t3/exec`

# GasOAuthLibrary

## Overview

This Google Apps Script project, "GasOAuthLibrary," is a reusable library that simplifies the OAuth2 authorization flow for other Google Apps Script projects. It provides a set of functions to handle the entire process, from generating an authorization URL to obtaining and refreshing access tokens.

## Functionality

The library is designed to be used by other scripts that need to access Google APIs on behalf of a user. It abstracts away the complexities of the OAuth2 flow.

### Core Features

- **`doGet(e)`:** The main entry point when the script is run as a web app. It sets up the necessary OAuth2 parameters (client ID, client secret, scopes, etc.) from `ScriptProperties` and displays a sample top page.
- **`getAuthorizationUrl()`:** Generates the authorization URL that the user needs to visit to grant permission. It includes the necessary parameters like `client_id`, `scope`, `redirect_uri`, and `state`.
- **`callback(e)`:** This is the callback function that Google redirects the user to after they have granted permission. It receives the authorization code, exchanges it for an access token and refresh token, and stores them securely.
- **Token Management:** The library includes functions to get, set, and refresh access tokens.

### Code Examples

#### `do.js` (Setup)
```javascript
function doGet(e) {
  setAuthorizationEndpoint("https://accounts.google.com/o/oauth2/auth")
  setClientId(PropertiesService.getScriptProperties().getProperty("client_id"));
  setScopeList(["https://www.googleapis.com/auth/script.storage"]);
  setClientSecret(PropertiesService.getScriptProperties().getProperty("client_secret"));
  setTokenEndpoint("https://accounts.google.com/o/oauth2/token");
  setCallbackFunctionName("callback");
  
  return HtmlService.createTemplateFromFile("sampleTopPage").evaluate().setTitle("GasOAuthLibrary");
}
```

#### `authorizationUrl.js`
```javascript
function getAuthorizationUrl() {
  var param = {
    "response_type": "code",
    "client_id": getClientId_(),
    "scope": getScopeList_(),
    "access_type": "offline",
    "prompt": "consent"
  };
  // ... (code to create state token and build the URL)
  var url = getAuthorizationEndpoint_() + "?" + params.join("&");
  return url;
}
```

#### `callback.js`
```javascript
function callback(e){
  // ... (code to handle the callback, exchange code for token)
  var http_response = UrlFetchApp.fetch(getTokenEndpoint_(), params);
  // ... (code to parse the response and store the tokens)
  setAccessToken_(endpointObject.access_token);
  setRefreshToken(endpointObject.refresh_token);
  
  // ... (code to display the result page)
}
```

## Permissions & Configuration

The `appsscript.json` file specifies that the web app is accessible to anyone and executes as the user accessing the app, which is standard for this type of OAuth2 library.

This library requires configuration in the `ScriptProperties` of the project that uses it. The following properties must be set:
- `client_id`
- `client_secret`

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "libraries": [{
      "userSymbol": "GasMarkdownToHtml",
      "libraryId": "1LKF9GU4JyjmsJY6weQQXgo3VOMhB6pvfXg0ZvoL17az7EQQER7klkkV-",
      "version": "4",
      "developmentMode": true
    }]
  },
  "webapp": {
    "access": "ANYONE",
    "executeAs": "USER_ACCESSING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has two deployments:

- **ID (HEAD):** `AKfycbx0Oggfb8v4_2wRERB5KIOXvDb0pQr0Zno_lcFI8VaE`
  - **URL:** `https://script.google.com/macros/s/AKfycbx0Oggfb8v4_2wRERB5KIOXvDb0pQr0Zno_lcFI8VaE/exec`
- **ID (Version 29):** `AKfycbxv8IbZj04X0f-P7vY2S8gfLyBsCTmy9eMyBcoUEHwwbyzi8IFY`
  - **URL:** `https://script.google.com/macros/s/AKfycbxv8IbZj04X0f-P7vY2S8gfLyBsCTmy9eMyBcoUEHwwbyzi8IFY/exec`

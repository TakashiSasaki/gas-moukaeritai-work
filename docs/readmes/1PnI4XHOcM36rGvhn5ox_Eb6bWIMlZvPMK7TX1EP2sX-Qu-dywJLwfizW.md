# Project: 1PnI4XHOcM36rGvhn5ox_Eb6bWIMlZvPMK7TX1EP2sX-Qu-dywJLwfizW

## Project Overview and Purpose

This Google Apps Script project is a web application designed to interact with the Slack API, specifically for managing and deleting old messages. It implements an OAuth 2.0 authorization flow to obtain user consent for accessing Slack data. The application provides a user interface for authorization, displaying Slack conversations, and managing a Google Spreadsheet to store related information. It leverages Google Apps Script's `HtmlService` for the web interface and `UrlFetchApp` for Slack API communication.

## Core Functionality

The project's core functionality revolves around Slack API integration, OAuth authorization, and Google Spreadsheet management.

### OAuth Authorization Flow (`oauth.js`, `doGet.js`)

*   **`buildAuthorizationUrl()` (in `oauth.js`)**: Constructs the Slack OAuth 2.0 authorization URL. It dynamically includes the `client_id` from script properties, a `redirect_uri` (obtained via `getCallbackUrl()`), and a `scope` (currently `channels:read`). A `state` token is generated using `ScriptApp.newStateToken()` to prevent CSRF attacks and link the authorization request to the callback. The generated URL is cached in `UserCache`.
*   **`catchRequestToken(e)` (in `oauth.js`)**: This function serves as the callback endpoint after a user authorizes the application on Slack. It extracts the authorization `code` from the event parameters, caches it, and then calls `fetchAccessToken()` to exchange the code for an access token. It then displays the `exchange.html` template.
*   **`fetchAccessToken()` (in `oauth.js`)**: Makes a POST request to Slack's `oauth.v2.access` endpoint to exchange the authorization `code` for an `access_token`. It uses `client_id` and `client_secret` from script properties. The response, including the `access_token`, `app_id`, `authed_user.id`, `scope`, `team.id`, `team.name`, etc., is parsed and cached in `UserCache`.
*   **`doGet(e)` (in `doGet.js`)**: The main entry point for the web application. It caches the effective user's email, loads the appropriate HTML template based on the `page` parameter in the URL (defaulting to `index`), and sets the page title.
*   **`getCallbackUrl()` (in `doGet.js`)**: Dynamically generates the callback URL for the web application, replacing `/dev` or `/exec` with `/usercallback`.

```javascript
// Excerpt from oauth.js - buildAuthorizationUrl
function buildAuthorizationUrl() {
  var url = "https://slack.com/oauth/v2/authorize";
  url += "?client_id=" + PropertiesService.getScriptProperties().getProperty("client_id");
  url += "&redirect_uri=" + getCallbackUrl();
  url += "&scope=channels:read";
  url += "&state=" + ScriptApp.newStateToken().withMethod("catchRequestToken").createToken();
  CacheService.getUserCache().put("authorizationUrl", url);
}

// Excerpt from oauth.js - fetchAccessToken
function fetchAccessToken() {
  var url = "https://slack.com/api/oauth.v2.access";
  const options = {
    "method": "POST",
    "payload": {
      "client_id": PropertiesService.getScriptProperties().getProperty("client_id"),
      "client_secret": PropertiesService.getScriptProperties().getProperty("client_secret"),
      "code": CacheService.getUserCache().get("code"),
      "redirect_uri": getCallbackUrl()
    }
  };
  const httpResponse = UrlFetchApp.fetch(url, options);
  const cache = CacheService.getUserCache();
  const parsedBody = JSON.parse(httpResponse.getContentText());
  cache.put("access_token", parsedBody.access_token, 21600); // Cache for 6 hours
  // ... (other data caching) ...
}
```

### Slack API Interaction (`slack.js`)

*   **`getConversationsList()` (in `slack.js`)**: Makes a GET request to Slack's `conversations.list` API endpoint to retrieve a list of public and private channels, direct messages, and group messages. It uses the `access_token` stored in `UserCache` for authorization.

```javascript
function getConversationsList() {
  const httpResponse = UrlFetchApp.fetch("https://slack.com/api/conversations.list",
  {
    "method" : "GET",
    "contentType":'application/json',
    "headers": {
      "Authorization" : "Bearer " + CacheService.getUserCache().get("access_token")
    }
  });
  return httpResponse.getContentText();
}
```

### Google Spreadsheet Management (`createNewSpreadsheet.js`)

*   **`createNewSpreadsheet()` (in `createNewSpreadsheet.js`)**: Creates a new Google Spreadsheet named "Slack Playground". If a spreadsheet ID is already set in user properties, it throws an error. The ID of the newly created spreadsheet is stored in user properties.

```javascript
function createNewSpreadsheet(){
  if(PropertiesService.getUserProperties().getProperty("spreadsheet_id")){
    throw new Error("Spreadsheet ID is alreadh set.");
  }
  const spreadsheet = SpreadsheetApp.create("Slack Playground");
  const spreadsheet_id = spreadsheet.getId();
  if(typeof spreadsheet_id !== "string") {
    throw new Error("Failed to create new spreadsheet.");
  }
  PropertiesService.getUserProperties().setProperty("spreadsheet_id", spreadsheet_id);
  return spreadsheet_id;
}
```

## Web Interface

The project's web interface is composed of several HTML files:

*   **`index.html`**: The main landing page. It displays the cached access token and provides a link to the authorization page (`authorize.html`). It also includes a menu for navigating to other parts of the application.
*   **`authorize.html`**: Displays the effective user's email, the web app URL, the cached access token, and the generated Slack authorization URL. It provides a clickable link to initiate the OAuth flow.
*   **`exchange.html`**: This template is displayed after Slack redirects back to the application with an authorization code. It shows the redirected data, the authorization code, and the data exchanged for the access token (retrieved from `UserCache`).
*   **`conversations.list.html`**: Displays the raw JSON output from the `getConversationsList()` Slack API call in a textarea.
*   **`spreadsheet.html`**: Provides an interface to manage the linked Google Spreadsheet. It displays the current spreadsheet ID, offers buttons to create a new spreadsheet, set an existing ID, and reset the ID.
*   **`menu.html`**: A reusable HTML snippet containing navigation links to `index.html`, `conversations.list.html`, `authorize.html`, and `spreadsheet.html`.
*   **`style.html`**: Contains CSS styling using Pico.css for a clean and responsive user interface.

## Permissions

The `appsscript.json` manifest file specifies the following permissions and access settings:

*   **Time Zone:** `America/New_York`
*   **Exception Logging:** `STACKDRIVER`
*   **Runtime Version:** `V8`
*   **Dependencies:** No external libraries are explicitly listed in `appsscript.json`.
*   **Web App Access:** `ANYONE` - The web application is accessible by anyone, including anonymous users.
*   **Web App Execution:** `USER_DEPLOYING` - The script runs under the identity of the user who deployed the web app. This is necessary for accessing script properties, user properties, and making `UrlFetchApp` calls to the Slack API.

## Configuration

*   **`client_id`**: The Slack application's client ID must be set as a script property (`PropertiesService.getScriptProperties()`).
*   **`client_secret`**: The Slack application's client secret must be set as a script property (`PropertiesService.getScriptProperties()`).
*   **`access_token`**: The Slack access token is stored in `UserCache` after successful OAuth authorization.
*   **`spreadsheet_id`**: The ID of the Google Spreadsheet used by the application is stored in user properties (`PropertiesService.getUserProperties()`).

## Deployments

The project has the following deployments:

*   **Deployment ID:** `AKfycbzO_DW7KYAsx80s1Izek_URNMC5CBhWnm7KpWUqmvA`
    *   **Target Version:** `HEAD`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbzO_DW7KYAsx80s1Izek_URNMC5CBhWnm7KpWUqmvA/exec`

*   **Deployment ID:** `AKfycbwHSQVrvJbZK1VUwjtLeAdnJq1pJbMJt14VxDlEkSYmxd51VGXw8dzRSrHNJMZAe_l9`
    *   **Target Version:** `6`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbwHSQVrvJbZK1VUwjtLeAdnJq1pJbMJt14VxDlEkSYmxd51VGXw8dzRSrHNJMZAe_l9/exec`

*   **Deployment ID:** `AKfycbz62pi_zgZzWT7DIOKy-dEwPBClTTJ7snZ0mW-Cu1PfrZMOQwHOAyf1HlSYFMM95uDe`
    *   **Target Version:** `7`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbz62pi_zgZzWT7DIOKy-dEwPBClTTJ7snZ0mW-Cu1PfrZMOQwHOAyf1HlSYFMM95uDe/exec`

*   **Deployment ID:** `AKfycbytQJQ2pbKqGNhsz4nuEH81TCyJUmuwT3aV_mipVhDWeWFXZRrgE9DiXm7TgmEp4Toe`
    *   **Target Version:** `5`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbytQJQ2pbKqGNhsz4nuEH81TCyJUmuwT3aV_mipVhDWeWFXZRrgE9DiXm7TgmEp4Toe/exec`

*   **Deployment ID:** `AKfycbzVCxJzdcc0TqvhaapgDF7w1rhm1Q4Nb4SIPIsPuomYo6C05k4`
    *   **Target Version:** `4`
    *   **Description:** `web app meta-version`
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbzVCxJzdcc0TqvhaapgDF7w1rhm1Q4Nb4SIPIsPuomYo6C05k4/exec`

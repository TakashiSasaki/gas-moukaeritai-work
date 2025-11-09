# Project: Pocket OAuth Add-on

This Google Apps Script project is designed as a Google Sheets add-on to facilitate OAuth authorization with the Pocket service. It provides a sidebar interface within Google Sheets to guide the user through obtaining a request token and an authorization URL from Pocket, which are the initial steps in the OAuth flow.

## Overview

The primary purpose of this add-on is to enable other Google Apps Script projects or the user to securely interact with the Pocket API. By handling the OAuth 1.0a (or similar) authorization process, it allows for programmatic access to a user's Pocket data after they grant permission.

## Functionality

The core functionality is implemented across `Code-v1.js`, `sidebar.html`, and `sidebar.js.html`.

### Core Features

-   **`onOpen(e)`**: This function is triggered when the Google Sheet is opened. It creates a custom add-on menu in the Google Sheets UI with an item "Show sidebar", which calls `showSidebar()`.
-   **`showSidebar()`**: Displays the `sidebar.html` content as a sidebar in the active Google Sheet.
-   **`fetchRequestToken()`**: This server-side function initiates the first step of the Pocket OAuth flow. It makes a POST request to Pocket's request token endpoint (`https://getpocket.com/v3/oauth/request`), using a `consumer_key` retrieved from script properties. It then extracts the `requestToken` from the response, stores it in `PropertiesService.getUserProperties()`, and returns it.
-   **Sidebar Interface**: The `sidebar.html` provides the user interface for the OAuth process.

### Code Examples

#### `Code-v1.js`

```javascript
function showSidebar() {
  const htmlTemplate = HtmlService.createTemplateFromFile("sidebar");
  const htmlOutput = htmlTemplate.evaluate();
  const ui = SpreadsheetApp.getUi();
  ui.showSidebar(htmlOutput);
}

function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  const menu = SpreadsheetApp.getUi().createAddonMenu();
  menu.addItem("Show sidebar", "showSidebar");
  menu.addToUi();
}

function fetchRequestToken() {
  PropertiesService.getUserProperties().deleteProperty("requestToken");
  const params = {
    method: "POST",
    payload: {
      consumer_key: PropertiesService.getScriptProperties().getProperty("consumer_key"),
      redirect_uri: "https://script.google.com/macros/s/AKfycbzYzJtSUVwHc6c9tTEkxOhB_ho8JmUJRSiHetr_p3PrOAmFBquBB7Rp9U06TNEP6v-6/usercallback",
    },
    muteHttpExceptions: true
  };
  console.log(params);
  const httpResponse = UrlFetchApp.fetch("https://getpocket.com/v3/oauth/request", params);
  const contentText = httpResponse.getContentText();
  console.log(contentText);
  const codekv = contentText.split("&")[0].split("=");
  console.log(codekv);
  if(codekv[0]=="code"){
    const code = codekv[1];
    console.log("request token = " + code)
    PropertiesService.getUserProperties().setProperty("requestToken", code);
    return code;
  }
  throw new Error("contentText");
}
```

## Web Interface (`sidebar.html` and `sidebar.js.html`)

The add-on provides a sidebar within Google Sheets:

-   **Request Token Display**: Shows the last fetched request token.
-   **"Get request token" Button**: Triggers the client-side `fetchRequestToken()` function, which calls the server-side `fetchRequestToken()` via `google.script.run`.
-   **Authorization URL Link**: Displays a link to the Pocket authorization URL, which the user needs to click to grant access. This URL is expected to be stored in `UserProperties` by a server-side function (e.g., `getAuthorizationUrl()`, which is called client-side but not explicitly defined in the provided server-side code).
-   **Client-side Scripting**: `sidebar.js.html` contains the JavaScript that handles button clicks and updates the sidebar content by interacting with server-side functions using `google.script.run`.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `ANYONE` (the web app is accessible by anyone). This is set for the web app deployment, but for an add-on, permissions are typically granted during installation.
-   **Libraries**: Depends on the `OAuth2` library (Script ID: `1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF`).
-   **Google Services**: Implicitly uses `SpreadsheetApp` for UI, `UrlFetchApp` for API calls, and `PropertiesService` for storing tokens.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **`consumer_key`**: A Pocket API Consumer Key must be set as a script property (`PropertiesService.getScriptProperties()`) for the OAuth flow to function.
-   **`requestToken`**: The obtained request token is stored in `PropertiesService.getUserProperties()`.
-   **`authorizationUrl`**: The generated authorization URL is expected to be stored in `PropertiesService.getUserProperties()`.

## Deployments

This project is deployed as a Google Apps Script web application, intended to function as a Google Sheets Add-on. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.

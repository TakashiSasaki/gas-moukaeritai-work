# Project: Google Apps Script OAuth2 Client

This Google Apps Script project is a web application designed to demonstrate and facilitate the OAuth2 authorization flow for Google APIs. Its primary purpose is to guide a user through the authorization process to obtain access and refresh tokens, which can then be used to interact with Google services.

## Overview

The project provides a user-friendly interface to initiate the OAuth2 flow, obtain authorization codes, and exchange them for access and refresh tokens. This is a fundamental component for any Google Apps Script application that needs to access Google APIs on behalf of a user.

## Functionality

The core functionality is implemented in `Code.js`, with the user interface defined in `index.html`.

### Core Features

-   **`getAuthorizationUrl()`**: Constructs the full Google OAuth2 authorization URL. This URL is used to redirect the user to Google's authorization server. It includes parameters such as `client_id`, `redirect_uri`, `scope` (e.g., `https://www.googleapis.com/auth/cloud-platform`), `response_type` (`code`), and `access_type` (`offline` to obtain a refresh token). It utilizes `ScriptApp.newStateToken()` to manage the OAuth state.
-   **`receiveAuthorizationCode(e)`**: This function acts as the callback endpoint for Google's authorization server. After a user grants permission, Google redirects to this function with an authorization `code`. The function extracts this `code` from the event parameters (`e`), stores it in `CacheService.getUserCache()`, and then calls `exchangeAuthorizationCodeForRefreshAndAccessTokens()` to complete the token exchange. Finally, it serves the `index.html` template.
-   **`exchangeAuthorizationCodeForRefreshAndAccessTokens()`**: Makes a POST request to Google's OAuth2 token endpoint (`https://oauth2.googleapis.com/token`). It sends the authorization `code` (retrieved from `CacheService`), `client_id`, `client_secret`, and `redirect_uri` to exchange for `access_token` and `refresh_token`. These tokens are then stored in `CacheService.getUserCache()`.
-   **`doGet()`**: The entry point for web app requests. It serves the `index.html` template.

### Code Examples

#### `Code.js`

```javascript
const client_id = "546346188438-rgmoo8uvqta07sal41p1cpdjaqmf4amm.apps.googleusercontent.com";
const client_secret = "fIG4_w8lWwmI_FbeZqdgki8g";

function myFunction() {
  const url = "https://cloudresourcemanager.googleapis.com/v1/projects";
  const httpResponse = UrlFetchApp.fetch(url);
  Logger.log(httpResponse);

}

function getAuthorizationUrl() {
  const endpointUrl = "https://accounts.google.com/o/oauth2/auth";
  const state = ScriptApp.newStateToken().withMethod("receiveAuthorizationCode").createToken();
  const client_id = "546346188438-rgmoo8uvqta07sal41p1cpdjaqmf4amm.apps.googleusercontent.com";
  const redirect_uri = "https://script.google.com/macros/s/AKfycbzapKCD4fac6szWRM2UquJ0hsiaQWrQ6FXPzHozx5CtNqqp_H5pUZAQsKBSiYZkEis/usercallback";
  const response_type = "code";
  const authorizationUri = endpointUrl + "?state=" + encodeURIComponent(state)
    + "&client_id=" + encodeURIComponent(client_id)
    + "&redirect_uri=" + encodeURIComponent(redirect_uri)
    + "&scope=" + encodeURIComponent("https://www.googleapis.com/auth/cloud-platform")
    + "&response_type=code"
    + "&access_type=offline";
  return authorizationUri;
}

function receiveAuthorizationCode(e) {
  const code = e.parameter.code;
  if (typeof code === "string" && code.length > 0) {
    CacheService.getUserCache().put("code", code);
  }
  exchangeAuthorizationCodeForRefreshAndAccessTokens();
  const htmlTemplate = HtmlService.createTemplateFromFile("index");
  const htmlOutput = htmlTemplate.evaluate();
  return htmlOutput;
}

function exchangeAuthorizationCodeForRefreshAndAccessTokens() {
  const endpointUrl = "https://oauth2.googleapis.com/token"
  const requestBody = {
    "client_id": "546346188438-rgmoo8uvqta07sal41p1cpdjaqmf4amm.apps.googleusercontent.com",
    "client_secret": "fIG4_w8lWwmI_FbeZqdgki8g",
    "grant_type": "authorization_code",
    "redirect_uri": "https://script.google.com/macros/s/AKfycbzapKCD4fac6szWRM2UquJ0hsiaQWrQ6FXPzHozx5CtNqqp_H5pUZAQsKBSiYZkEis/usercallback",
    "state": ScriptApp.newStateToken().withMethod("receiveRefreshAndAccessToken"),
    "code": CacheService.getUserCache().get("code")
  }
  const httpResponse = UrlFetchApp.fetch(endpointUrl, {
    "method": "POST",
    "payload": requestBody,
    "muteHttpExceptions": true
  });
  const contentText = httpResponse.getContentText();
  const o = JSON.parse(contentText);
  const access_token = o.access_token;
  const refresh_token = o.refresh_token;
  CacheService.getUserCache().put("access_token", access_token);
  CacheService.getUserCache().put("refresh_token", refresh_token);
}

function receiveRefreshAndAccessTokens(e) {
  const textOutput = ContentService.createTextOutput(JSON.stringify(e));
  return textOutput;
}

function getToken() {
  const url = "https://accounts.google.com/o/oauth2/auth";
  const param = {
    "method": "POST",
    "payload": {
      "grant_type": "authorization_code",
      "client_id": client_id,
      "client_secret": client_secret
    },
    "muteHttpExceptions": true
  }
  const httpResponse = UrlFetchApp.fetch(url, param);
  Logger.log(httpResponse);
}

function doGet() {
  const htmlTemplate = HtmlService.createTemplateFromFile("index");
  const htmlOutput = htmlTemplate.evaluate();
  return htmlOutput;
}
```

## Web Interface (`index.html`)

The `index.html` file provides a simple user interface for initiating the OAuth2 flow and displaying the obtained tokens:

-   **Authorization URL Link**: A clickable link labeled "authorization URL" that, when clicked, redirects the user to Google's authorization page. The URL is dynamically generated by the server-side `getAuthorizationUrl()` function.
-   **Token Display**: Read-only input fields are provided to display the `Authorization Code`, `Access Token`, and `Refresh Token`. These values are retrieved from `CacheService.getUserCache()` and injected into the HTML using server-side templating (`<?= ... ?>`).
-   **Styling**: The interface uses `mini.css` for basic, minimalist styling.

## Permissions

The `appsscript.json` manifest specifies the following web app execution permissions:

-   **Execution**: `USER_DEPLOYING` (the script will execute with the identity and permissions of the user who deployed the web app).
-   **Access**: `MYSELF` (the web application can only be accessed by the user who deployed it). This is a security measure appropriate for handling sensitive OAuth tokens.
-   **OAuth Scopes**: The `Code.js` file explicitly requests the `https://www.googleapis.com/auth/cloud-platform` scope during authorization. Implicitly, `UrlFetchApp` requires `https://www.googleapis.com/auth/script.external_request`.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Hardcoded Credentials**: The `client_id` and `client_secret` are hardcoded directly in `Code.js`. For production environments, these sensitive credentials should be stored securely using `PropertiesService` or `Secret Manager`.
-   **`redirect_uri`**: The OAuth redirect URI is hardcoded in `Code.js`.

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
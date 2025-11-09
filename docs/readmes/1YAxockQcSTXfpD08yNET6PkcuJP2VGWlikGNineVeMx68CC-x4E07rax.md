# Project: Google Apps Script OAuth2 Client and Remote Executor

This Google Apps Script project is a web application that functions as an OAuth2 client for Google APIs. Its primary purpose is to facilitate the authorization flow to obtain and manage access tokens for Google services. Additionally, it provides functionality to remotely execute functions in other Google Apps Scripts and manage Apps Script triggers.

## Overview

The project aims to simplify OAuth2 integration for Google Apps Script developers, offering a web-based interface to handle the authorization process. Beyond authentication, it extends its utility by enabling programmatic interaction with other scripts and their triggers, making it a powerful tool for orchestrating complex Google Apps Script solutions.

## Functionality

The core functionality is implemented across `doGet.js`, `usercallback.js`, `exec.js`, `ping.js`, and `trigger.js`.

### Core Features

-   **OAuth2 Authorization Flow**:
    -   **`doGet()`**: Serves as the initial entry point for the web application. It manages the display of OAuth-related information, checking for existing access tokens or authorization codes in user properties and cache, respectively. It serves an HTML template (implied to be `code.html`) to guide the user through the authorization process.
    -   **`usercallback(e)`**: This function acts as the OAuth2 callback endpoint. After a user grants permissions, Google redirects to this function with an authorization `code`. It stores this `code` in `CacheService`, calls `fetchAccessToken()`, and then serves the `code.html` template.
    -   **`fetchAccessToken()`**: Exchanges the authorization `code` for an `access_token` and `refresh_token` with Google's OAuth2 token endpoint. These tokens are then securely stored in `PropertiesService.getUserProperties()`.
    -   **`deleteToken()`**: Clears the stored `access_token` from user properties.
-   **Remote Script Execution**:
    -   **`exec(function_name, parameters)`**: Executes a specified Google Apps Script function (`function_name`) in another script (identified by Script ID `1NYN_AoEoGoZIOKurCE2dSWFMzpBTeZFczQ-q_F4d-mvQ2XK6rdtz3Zev`) using the Apps Script API. It uses the obtained `access_token` for authorization.
    -   **`ping(echo_string)`**: A utility function that calls `exec("hello", [echo_string])`, likely used to test the remote execution capability.
-   **Apps Script Trigger Management**:
    -   **`getTriggers()`**: Retrieves all project triggers.
    -   **`setTrigger(function_name)`**: Creates a new time-based trigger that runs `function_name` every hour.
    -   **`deleteTimeBasedTriggers()`**: Deletes all time-based triggers associated with the project.
    -   **`getTriggersAsTable()`**: Returns a table (2D array) of trigger details, including type, function name, source, source ID, and unique ID.

### Code Examples

#### `doGet.js`

```javascript
function doGet(){
  if(!PropertiesService.getUserProperties().getProperty("access_token")){
    if(!CacheService.getUserCache().get("code")) {
      var html_template = HtmlService.createTemplateFromFile("code");
      var html_output = html_template.evaluate();
      return html_output;
    } else {
      fetchAccessToken();
      var html_template = HtmlService.createTemplateFromFile("code");
      var html_output = html_template.evaluate();
      return html_output;  
    }
  } else {
    var html_template = HtmlService.createTemplateFromFile("code");
    var html_output = html_template.evaluate();
    return html_output;
  }
}

function deleteToken(){
  PropertiesService.getUserProperties().deleteProperty("access_token");
}
```

#### `usercallback.js`

```javascript
active_user = Session.getActiveUser();
effective_user = Session.getEffectiveUser();

/**
  リロードにより重複して呼び出された場合でも
  既に取得したトークンを破壊しないようにしなければならない。
*/
function usercallback(e){
  try {
    CacheService.getUserCache().put("code", e.parameter.code);
    Logger.log(e.parameter.code);
  } catch (exception){
    //do nothing
  }
  fetchAccessToken();
  var html_template = HtmlService.createTemplateFromFile("code");
  var html_output = html_template.evaluate();
  return html_output;
}

function fetchAccessToken(){
  if(!CacheService.getUserCache().get("code")) {
    Loggerlog("!code : " + code);
    return;
  }
  var endpoint_url = "https://accounts.google.com/o/oauth2/token";
  var params = {
    "method" : "POST",
    "payload" : {
      "code" : CacheService.getUserCache().get("code"),
      "client_id" : PropertiesService.getScriptProperties().getProperty("client_id"),
      "client_secret" : PropertiesService.getScriptProperties().getProperty("client_secret"),
      "redirect_uri" :PropertiesService.getScriptProperties().getProperty("redirect_uri"),
      "grant_type" : "authorization_code",
    },
    "muteHttpExceptions" : true
  };
  CacheService.getUserCache().remove("code");
  var http_response = UrlFetchApp.fetch(endpoint_url, params);
  var json_string = http_response.getContentText();
  if(!json_string) {
    return;
  }
  var json_object = JSON.parse(json_string);
  Logger.log(json_object);
  var access_token = json_object.access_token;
  var token_type = json_object.token_type;
  var expires_in = json_object.expires_in;
  var refresh_token = json_object.refresh_token;
  if(!access_token) {
    return;
  }
  PropertiesService.getUserProperties().setProperty("access_token", access_token);
  PropertiesService.getUserProperties().setProperty("token_type", token_type);
  PropertiesService.getUserProperties().setProperty("expires_in", expires_in);  
  PropertiesService.getUserProperties().setProperty("refresh_token", refresh_token);  
}
```

#### `exec.js`

```javascript
function exec(function_name, parameters) {
  var params = {
    "method" : "POST",
    "contentType" : "application/json",
    "headers" : {
      "Authorization" : "Bearer " + PropertiesService.getUserProperties().getProperty("access_token")
    },
    "payload" : JSON.stringify({
      "function": function_name,
      "parameters": parameters,
      "devMode" : true
    }),
    "muteHttpExceptions": true
  };
  var url = "https://script.googleapis.com/v1/scripts/" 
          + "1NYN_AoEoGoZIOKurCE2dSWFMzpBTeZFczQ-q_F4d-mvQ2XK6rdtz3Zev"
          + ":run";
  var http_response = UrlFetchApp.fetch(url, params);
  var content_text = http_response.getContentText();
  var json_object = JSON.parse(content_text);
  var result = json_object.response.result;
  Logger.log(content_text);
  return result;
}
```

## Web Interface (`oauth.html`, `token.html`, `tab1.html`, `tab2.html`, `tab3.html`, `redirect.html`)

The project includes several HTML files that likely form a multi-tab web interface focused on displaying OAuth-related information and potentially other functionalities. The `code.html` (implied) would be central to displaying the OAuth flow status.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `MYSELF` (the web app is accessible only by the user who deployed it). This is a security measure appropriate for handling sensitive OAuth tokens.
-   **OAuth Scopes**: The `usercallback.js` implies the need for scopes related to Google APIs, as it interacts with `accounts.google.com/o/oauth2/token`. The `exec.js` function explicitly uses the `https://www.googleapis.com/auth/script.external_request` scope for calling the Apps Script API.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **`client_id`**: The Google API client ID must be set as a script property (`PropertiesService.getScriptProperties()`).
-   **`client_secret`**: The Google API client secret must be set as a script property (`PropertiesService.getScriptProperties()`).
-   **`redirect_uri`**: The OAuth redirect URI must be set as a script property.
-   **`access_token`**, `token_type`, `expires_in`, `refresh_token`: These are stored in `PropertiesService.getUserProperties()` after successful OAuth.
-   **Remote Script ID**: The `exec.js` function is hardcoded to execute functions in script ID `1NYN_AoEoGoZIOKurCE2dSWFMzpBTeZFczQ-q_F4d-mvQ2XK6rdtz3Zev`.

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.

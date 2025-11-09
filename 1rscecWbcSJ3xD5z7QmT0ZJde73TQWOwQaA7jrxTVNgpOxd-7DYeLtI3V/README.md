# Project: Debugging and Testing Utility

This Google Apps Script project functions as a web application and potentially a Google Form add-on, primarily designed for debugging and testing interactions with Google Forms and Spreadsheets. It captures and displays request parameters, user information, and provides utilities to manage and interact with debug forms and spreadsheets.

## Overview

The main purpose of this project is to provide developers with a tool to inspect incoming web app requests, manage test environments (forms and spreadsheets), and simulate form submissions, including those with file uploads.

## Functionality

The core functionality is implemented across `コード.js`, `getDebugProperties.js`, and the web interface (`index.html`).

### Core Features

-   **`doGet(e)`**: This function serves as the entry point for the web application. It captures the incoming event object `e` (parameters, post data, etc.), and user session information (`Session.getActiveUser()`, `Session.getEffectiveUser()`). These details are then made available to the `index.html` template. It also sets the sandbox mode to `IFRAME`.
-   **`doPost(e)`**: Handles HTTP POST requests. It logs the incoming event object `e` and its post data, then delegates to `doGet(e)` to display the request information.
-   **`onInstall(e)` / `onOpen(e)`**: These functions are typically used for Google Workspace Add-ons. `onInstall` calls `onOpen`, and `onOpen` shows a sidebar, suggesting this project might also function as a Google Form add-on.
-   **`getDebugSpreadsheetId()`**: Retrieves the URL of a debug spreadsheet from script properties, opens it, and stores its ID back into script properties.
-   **`getDebugFormId()`**: Retrieves the URL of a debug form from script properties, opens it, and stores its ID and published URL into script properties.
-   **`getDebugFormEntryNamesAndSubmitUrl()`**: Fetches the published URL of the debug form, uses the `PublishedFormParser` library to extract the form's entry names and submission URL, and stores them in script properties.
-   **`postDebugForm()`**: Constructs a payload using the extracted debug form entry names and submits it to the debug form's submission URL using `UrlFetchApp.fetch()`.

### Code Examples

#### `コード.js`

```javascript
function doGet(e) {
  given_parameter = JSON.stringify(e);
  active_user = Session.getActiveUser();
  effective_user = Session.getEffectiveUser();
  json_string = JSON.stringify(e);
  var html_template = HtmlService.createTemplateFromFile("index");
  var html_output = html_template.evaluate();
  html_output.setSandboxMode(HtmlService.SandboxMode.IFRAME);
  return html_output;
}

function doPost(e) {
  Logger.log(e);
  Logger.log(e.postData.getDataAsString());
  return doGet(e);
}
```

#### `getDebugProperties.js`

```javascript
function getDebugFormEntryNamesAndSubmitUrl(){
  var sp = PropertiesService.getScriptProperties();
  var debug_form_published_url = sp.getProperty("DEBUG_FORM_PUBLISHED_URL");
  var http_response = UrlFetchApp.fetch(debug_form_published_url);
  var content_text = http_response.getContentText();
  var debug_form_entry_names = PublishedFormParser.getEntryNames(content_text);
  sp.setProperty("DEBUG_FORM_ENTRY_NAMES", JSON.stringify(debug_form_entry_names));
  var debug_form_submit_url = PublishedFormParser.getSubmitUrl(content_text);
  sp.setProperty("DEBUG_FORM_SUBMIT_URL", debug_form_submit_url);
}

function postDebugForm(){
  var sp = PropertiesService.getScriptProperties();
  var DEBUG_FORM_SUBMIT_URL = sp.getProperty("DEBUG_FORM_SUBMIT_URL");
  var DEBUG_FORM_ENTRY_NAMES = sp.getProperty("DEBUG_FORM_ENTRY_NAMES");
  var debug_form_entry_names = JSON.parse(DEBUG_FORM_ENTRY_NAMES);
  var payload = {};
  for(i in debug_form_entry_names) {
     var name = debug_form_entry_names[i];
     var value = i;
     payload[name] = value;
  }
  
  var option = {
    "method" : "POST",
    "payload" : payload
  }
  var http_response = UrlFetchApp.fetch(DEBUG_FORM_SUBMIT_URL, option);
  Logger.log(http_response);
}
```

## Web Interface (`index.html`)

The `index.html` file provides a simple web interface for displaying debug information and interacting with forms:

-   **Request and User Information**: Displays the `active_user`, `effective_user`, and the `json_string` representation of the incoming event object `e`.
-   **File Upload Inputs**: Includes `<input type="file">` elements with `capture=camera` attributes, suggesting functionality for testing form submissions that include image data captured directly from a camera.
-   **Test POST Form**: A basic HTML form that allows submitting data via POST to a URL specified in script properties (`WEB_APP_URL_DEV`).

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `ANYONE_ANONYMOUS` (the web app is accessible by anyone, including anonymous users).
-   **Libraries**: Depends on the `PublishedFormParser` library (Script ID: `1fc66EogeAcmTnLLgk76XMjKqG7rbYH7tXSN5yRA66tLoSWL85QvuvbLR`).
-   **Google Services**: Implicitly uses `FormApp`, `SpreadsheetApp`, `UrlFetchApp`, `PropertiesService`, and `HtmlService`.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Script Properties**: Relies on several script properties for configuration:
    -   `DEBUG_SPREADSHEET_URL`
    -   `DEBUG_SPREADSHEET_ID`
    -   `DEBUG_FORM_URL`
    -   `DEBUG_FORM_ID`
    -   `DEBUG_FORM_PUBLISHED_URL`
    -   `DEBUG_FORM_ENTRY_NAMES`
    -   `DEBUG_FORM_SUBMIT_URL`
    -   `WEB_APP_URL_DEV`

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.

# FileChooser (Google Picker API Wrapper)

## Overview

The "FileChooser" project is a Google Apps Script library designed to simplify the integration and usage of the Google Picker API within web applications. It provides a set of helper functions that generate HTML buttons, each configured to launch the Google Picker for specific file types or views (e.g., Google Docs, images, videos, folders, PDFs, YouTube). The project includes a demo web application (`demo.html`) that illustrates how to utilize these functions to create a file selection interface. It depends on the `FilePicker` library (Script ID `13LSMt2i9zJj3Bg0rE1bw2Rr1p3WRJM8WogMlr5FZCcyejMQyFEAtCy45`) and requires a Google Cloud Console Client ID for OAuth authorization.

## Functionality

The project's primary goal is to abstract the complexities of the Google Picker API, offering a straightforward way to embed file selection capabilities into web apps.

### Core Features

-   **`doGet()`:** The entry point for the demo web application, which renders `demo.html` and sets the page title to "File Picker".
-   **`buttonElement_(viewName, callbackFunctionName)`:** A core helper function that generates an HTML button. When clicked, this button launches the Google Picker configured for a specific `viewName` (e.g., `DOCS`, `IMAGES`) and calls a JavaScript `callbackFunctionName` with the selected file metadata.
-   **Type-Specific Button Generators:** A series of functions (e.g., `DOCS()`, `DOCS_IMAGES()`, `FOLDERS()`, `SPREADSHEETS()`, `YOUTUBE()`) that wrap `buttonElement_` to create buttons for various Google Picker views.
-   **`scriptElement(clientId)`:** A server-side function that injects the client-side JavaScript (`js.html`) into the main HTML, passing the Google Cloud Console Client ID required for OAuth.
-   **Client-side `FilePicker` Class (`js.html`):** This JavaScript class handles the actual interaction with the Google Picker API. It manages OAuth authorization using `gapi.auth.authorize` and constructs the `google.picker.PickerBuilder` with the appropriate views and callbacks.
-   **Demo Application (`demo.html`):** Showcases the usage of the library by displaying various file picker buttons and a `textarea` to output the metadata of selected files.

### Code Examples

#### `doget.js`

```javascript
function doGet() {
  var htmlTemplate = HtmlService.createTemplateFromFile("demo");
  var htmlOutput = htmlTemplate.evaluate().setTitle("File Picker");
  return htmlOutput;
}
```

#### `buttonElement.js` (Example)

```javascript
function DOCS(callbackFunctionName){
  return buttonElement_('DOCS', callbackFunctionName);
}

function FOLDERS(callbackFunctionName){
  return buttonElement_('FOLDERS', callbackFunctionName);
}

function buttonElement_(viewName, callbackFunctionName) {
  var button = '<button onclick="(new FilePicker()).'+ viewName +'(' + callbackFunctionName + ');">pick ' + viewName + '</button>';
  return button;
}
```

#### `scriptelement.js`

```javascript
function scriptElement(clientId) {
  var htmlTemplate = HtmlService.createTemplateFromFile("js");
  htmlTemplate.clientId = clientId;
  var htmlOutput = htmlTemplate.evaluate();
  return htmlOutput.getContent();
}
```

#### `js.html` (Client-side `FilePicker` class snippet)

```html
<script>
function FilePicker() {
  var self = this;
  self.oauthToken;

  self.DOCS = function(callback){
    self.show(google.picker.ViewId.DOCS, callback);
  }
  // ... other view functions ...

  self.show = function (viewId, callback) {
    if (!self.oauthToken) {
      gapi.auth.authorize({
          'client_id': '<?!=clientId?>',
          'scope': ['https://www.googleapis.com/auth/photos', "https://www.googleapis.com/auth/drive.readonly", " https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/photos.upload", "https://www.googleapis.com/auth/youtube"],
          'immediate': false
        },
        function (authResult) {
          if (authResult && !authResult.error) {
            self.oauthToken = authResult.access_token;
            self.show(viewId, callback);
          }
        }
      );
      return;
    }
    // ... picker builder logic ...
  }
}
</script>
```

## Permissions

The `appsscript.json` file specifies a dependency on the `FilePicker` library and configures the project as a web application that executes as the user who deployed it and is accessible by anyone anonymously. The OAuth scopes required for the Google Picker API are dynamically requested client-side.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "libraries": [{
      "userSymbol": "FilePicker",
      "libraryId": "13LSMt2i9zJj3Bg0rE1bw2Rr1p3WRJM8WogMlr5FZCcyejMQyFEAtCy45",
      "version": "40"
    }]
  },
  "webapp": {
    "access": "ANYONE_ANONYMOUS",
    "executeAs": "USER_DEPLOYING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has one deployment:

-   **ID (HEAD):** `AKfycbyd3QElFzGxES7C1tPTDkt_gbR7ca7hwP9LNFqOHUP6`
    -   **URL:** `https://script.google.com/macros/s/AKfycbyd3QElFzGxES7C1tPTDkt_gbR7ca7hwP9LNFqOHUP6/exec`

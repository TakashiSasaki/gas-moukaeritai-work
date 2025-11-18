# GetFragmentPartOfUrlTest

## Overview

This Google Apps Script project, "GetFragmentPartOfUrlTest," is a web app created to test and demonstrate the behavior of different sandbox modes in Google Apps Script. Specifically, it was designed to show how the `NATIVE`, `EMULATED`, and `IFRAME` sandbox modes affect a script's ability to access the URL's fragment (the part of the URL after the `#` symbol).

This project is primarily a historical artifact, as the `NATIVE` and `EMULATED` sandbox modes have been deprecated since 2016.

## Functionality

The web app serves a single page (`index.html`) that explains the issue and provides links to test the page in each of the three sandbox modes. The client-side JavaScript on the page then attempts to access `location.hash` and other properties of the `location` object and displays the results.

### Core Features

- **`doGet(e)`:** The main entry point for the web app. It sets the sandbox mode based on a URL parameter (`?sandbox=...`) and serves the `index.html` page.
- **`index.html`:** The main page contains a detailed explanation of the problem, links to test each sandbox mode, and a display of the values of various `location` properties.
- **`count()`:** A simple counter that tracks how many times the page has been requested.

### Code Examples

#### `コード.js`
```javascript
function doGet(e) {
  sandbox = "HtmlService.SandboxMode.NATIVE";
  if(e.parameter.sandbox == "IFRAME") {
    sandbox = "HtmlService.SandboxMode.IFRAME";
  } else if(e.parameter.sandbox == "EMULATED") {
    sandbox = "HtmlService.SandboxMode.EMULATED";
  }
  
  var html_template = HtmlService.createTemplateFromFile("index");
  var html_output = html_template.evaluate();
  html_output.setSandboxMode(HtmlService.SandboxMode.NATIVE);
  if(e.parameter.sandbox == "IFRAME") {
    html_output.setSandboxMode(HtmlService.SandboxMode.IFRAME);
  } else if(e.parameter.sandbox == "EMULATED") {
    html_output.setSandboxMode(HtmlService.SandboxMode.EMULATED);
  }
  html_output.addMetaTag("viewport", "width=device-width,initial-scale=1");
  html_output.setTitle("accessing location object of top window in Google Apps Script");
  return html_output;
}
```

## Permissions

The `appsscript.json` file specifies that the web app is accessible to anyone, including anonymous users, and executes as the user who deployed it.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
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

The project has two deployments:

- **ID (HEAD):** `AKfycbxSsq557h5yz-o_1dGIoZPy1GR1caRJZIu1NeHdbqo`
  - **URL:** `https://script.google.com/macros/s/AKfycbxSsq557h5yz-o_1dGIoZPy1GR1caRJZIu1NeHdbqo/exec`
- **ID (Version 28):** `AKfycbxyrBwHW1Fa89GlU06QJ8RRgc0WWr6p_S3czBghW_1E5QQgP3U`
  - **URL:** `https://script.google.com/macros/s/AKfycbxyrBwHW1Fa89GlU06QJ8RRgc0WWr6p_S3czBghW_1E5QQgP3U/exec`

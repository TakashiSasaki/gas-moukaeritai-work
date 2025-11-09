# Html (Persistent Form Component)

## Overview

The "Html" project is a Google Apps Script component designed to provide "persistent form" functionality for web applications. It consists of JavaScript and CSS files that enable HTML form elements (specifically text inputs, text areas, and checkboxes with the class `persistentForm`) to automatically save their values to and load them from the user's browser's `localStorage`. This ensures that data entered into these form fields persists across browser sessions or page reloads, enhancing user experience.

## Functionality

This project primarily offers client-side functionality to make form fields persistent. It provides functions to retrieve the necessary JavaScript and CSS content for inclusion in other HTML files.

### Core Features

-   **Persistent Form Fields:** Automatically saves the values of text inputs, text areas, and checkboxes (identified by the `persistentForm` class and a unique `id`) to `localStorage` when their values change.
-   **Automatic Data Loading:** Loads the saved values from `localStorage` into the respective form fields when the page loads.
-   **Styling for Persistent Fields:** Provides CSS to visually indicate persistent form fields (e.g., `lightyellow` background, blue border).
-   **Modular Inclusion:** The JavaScript and CSS are provided as separate HTML files (`persistentFormJs.html` and `persistentFormCss.html`) that can be easily included into other Google Apps Script HTML templates using `HtmlService.createHtmlOutputFromFile().getContent()`.

### Code Examples

#### `persistentFormScript.js` (Server-side function to get client-side JS)

```javascript
function persistentFormScript() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile("persistentFormJs");
  return htmlOutput.getContent();
}//persistentFormScript
```

#### `persistentFormStyle.js` (Server-side function to get client-side CSS)

```javascript
function persistentFormStyle() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile("persistentFormCss");
  return htmlOutput.getContent();
}//persistentFormStyle
```

#### `persistentFormJs.html` (Client-side JavaScript)

```html
<script>
setTimeout(function() {
  document.querySelectorAll("input[type='text'].persistentForm").forEach(function(inputElement) {
    inputElement.addEventListener("change", function(event) {
      var key = event.target.id;
      var value = event.target.value;
      window.localStorage.setItem(key, value);
    }, true);
    inputElement.addEventListener("load", function(event) {
      console.log(event.target.type);
      var key = event.target.id;
      var value = window.localStorage.getItem(key);
      event.target.value = value;
    });
  });
  // ... similar logic for textarea and checkbox ...
}, 10);

// ... dispatch load and change events ...
</script>
```

#### `persistentFormCss.html` (Client-side CSS)

```html
<style>
      input.persistentForm:read-write {background: lightyellow; border-width:2px; border-color:blue;}
      textarea.persistentForm:read-write {background: lightyellow; border-width:2px; border-color:blue;}
      input[type="checkbox"].persistentForm {background: lightyellow; border-width:2px; border-color:blue;}
</style>
```

## Permissions

The `appsscript.json` file indicates that this project is configured as a web application, executing as the user who deployed it, and accessible only by that user. This suggests it's intended for personal use or as a component within a larger, user-specific application.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
  },
  "webapp": {
    "access": "MYSELF",
    "executeAs": "USER_DEPLOYING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has two deployments:

-   **ID (HEAD):** `AKfycbye6El4kJTJLktLMJPZ5zM6XySIGetctwecvTzYc44`
    -   **URL:** `https://script.google.com/macros/s/AKfycbye6El4kJTJLktLMJPZ5zM6XySIGetctwecvTzYc44/exec`
-   **ID (Version 5 - web app meta-version):** `AKfycbx79PNe1CHv5o5rgos0slKmG5uEC873UDW4WGmhmHA-4-XpVfo`
    -   **URL:** `https://script.google.com/macros/s/AKfycbx79PNe1CHv5o5rgos0slKmG5uEC873UDW4WGmhmHA-4-XpVfo/exec`

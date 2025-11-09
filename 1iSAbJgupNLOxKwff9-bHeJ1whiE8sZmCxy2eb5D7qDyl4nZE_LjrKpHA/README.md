# ArecXのスター表示に関するテスト (ArecX Star Display Test)

## Overview

The "ArecXのスター表示に関するテスト" project is a Google Apps Script web application designed as a test or utility for interacting with a media player or server, possibly referred to as "ArecX". It provides a simple interface for users to configure a host part, save this configuration, and then generate and access specific "player pages" on that host. The application utilizes client-side JavaScript with jQuery for dynamic interactions.

## Functionality

The project's core functionality is exposed through a web interface, allowing users to manage a host setting and interact with a remote player.

### Core Features

-   **Host Part Configuration:** Users can input and save a "host part" (likely a domain or IP address) using an input field. This value is stored in `UserProperties` for persistence.
-   **Player Page Access:** The application can construct URLs to specific "player pages" on the configured host.
-   **AJAX Request to Player Page:** The `getPlayerPage()` function sends an AJAX request to a constructed player page URL.
-   **Open Player Page in New Window:** The `openPlayerPage()` function opens the constructed player page URL in a new browser window or tab.
-   **Client-side Scripting:** Uses jQuery for handling UI interactions and AJAX requests.

### Code Examples

#### `Code.js` (Implicitly defined functions)

The `Code.js` file is not explicitly provided, but based on `index.html` and `js.html`, the following server-side function is expected:

```javascript
function saveHostPart(hostPart) {
  PropertiesService.getUserProperties().setProperty('host_part', hostPart);
}
```

#### `doGet.js` (Implicitly defined)

The `doGet` function is the entry point for the web app:

```javascript
function doGet() {
  return HtmlService.createTemplateFromFile("Index").evaluate();
}
```

#### `index.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
  </head>
  <body>
      <input id="host_part" value="<?=PropertiesService.getUserProperties().getProperty('host_part')?>">
    <button onclick="saveHostPart();" >saveHostPart()</button>
    <button onclick="getPlayerPage();" >getPlayerPage()</button>
    <button onclick="openPlayerPage();">openPlayerPage()</button>
    <?!= HtmlService.createHtmlOutputFromFile("js").getContent()?>
  </body>
</html>
```

#### `js.html`

```html
<script>
function getPlayerPage(){
  var url = "http://" + $("#host_part").val() + "/filelist.php?mode=play&rec_id=20160414_165000_27_51";
  alert(url);
  $.ajax({
    url: url
  });
}

function openPlayerPage(){
  var url = "http://" + $("#host_part").val() + "/filelist.php?mode=play&rec_id=20160414_165000_27_51";
  alert(url);
  window.open(url);
}

function saveHostPart(){
  var host_part = $("#host_part").val();
  alert(host_part);
  google.script.run.saveHostPart(host_part);
}
</script>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
```

## Permissions

The `appsscript.json` file indicates that this project runs as a web application, executing as the user accessing it, and is accessible by anyone.

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

## Deployments

The project has two deployments:

-   **ID (HEAD):** `AKfycbw4NDrkymMtj1_jF5tT5emKpm2Si5pEJZGOOm69zNIW`
    -   **URL:** `https://script.google.com/macros/s/AKfycbw4NDrkymMtj1_jF5tT5emKpm2Si5pEJZGOOm69zNIW/exec`
-   **ID (Version 1 - web app meta-version):** `AKfycbwleNQ2aLMg4bRGhiSESkDOxbLHCa0OqaheVI08zsl5Ue0kwMaQ`
    -   **URL:** `https://script.google.com/macros/s/AKfycbwleNQ2aLMg4bRGhiSESkDOxbLHCa0OqaheVI08zsl5Ue0kwMaQ/exec`

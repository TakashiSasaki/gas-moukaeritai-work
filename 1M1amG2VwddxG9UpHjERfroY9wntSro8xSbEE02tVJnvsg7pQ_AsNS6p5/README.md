# Project: 1M1amG2VwddxG9UpHjERfroY9wntSro8xSbEE02tVJnvsg7pQ_AsNS6p5

## Project Overview and Purpose

This Google Apps Script project is designed to interact with the Automate community API to retrieve and display a list of "flows" (programs created by users) for a given user ID. It provides a web interface where users can input an Automate user ID and then view the associated flows in various formats (HTML, JSON, CSV, TSV). The project aims to help users explore flows created by specific members of the Automate community.

## Core Functionality

### `コード.js` (Code.js)

This script contains the core logic for the web application, including handling HTTP GET requests, fetching data from the Automate community API, and formatting the output.

*   **`doGet(e)`**: This function is the entry point for web app requests.
    *   If no `user_id` parameter is provided, it serves the `readme.html` file.
    *   If a `user_id` is provided, it fetches flows using `fetchFlows()`.
    *   It can return the flow list as an HTML page (`index.html`), JSON, CSV, or TSV based on the `format` parameter.
    *   It uses `ContentService` for text-based outputs (JSON, CSV, TSV) and `HtmlService` for HTML output.
*   **`getDateTimeString(epochmill)`**: A helper function to convert an epoch timestamp in milliseconds to a formatted date and time string.
*   **`fetchFlows(user_id)`**: This function makes an HTTP request to the Automate community API to retrieve flow data for a given `user_id`. It uses `UrlFetchApp.fetch()` and parses the JSON response. It also attempts to cache the response using `CacheService.getScriptCache()`.

```javascript
function doGet(e) {
  if(!e.parameter.user_id) {
    return HtmlService.createHtmlOutputFromFile("readme").setTitle("Automate flow list @TakashiSasaki");
  }
  Logger.log(e.parameter.user_id);
  flows = fetchFlows(e.parameter.user_id);
  if(!e.parameter.format) {
    var html_template = HtmlService.createTemplateFromFile("index");
    var html_output = html_template.evaluate().setTitle("Automate flow list @TakashiSasaki");
    return html_output;
  }
  if(e.parameter.format == "csv") {
    var content = "";
    var separator = ",";
    for(var i=0; i<flows.length; ++i) {
      content += (flows[i]["id"] + separator);
      content += (flows[i]["user"]["id"] + separator);
      content += ("\"" + flows[i]["user"]["name"].replace(/"/g, "\"\"")) + "\"" + separator;
      content += (flows[i]["category"]["id"] + separator);
      content += ("\"" + flows[i]["category"]["title"].replace(/"/g, "\"\"")) + "\"" + separator;
      content += (flows[i]["category"]["restricted"] + separator);
      content += ("\"" + flows[i]["title"].replace(/"/g, "\"\"")) + "\"" + separator;
      content += ("\"" + flows[i]["description"].replace(/"/g, "\"\"")) + "\"" + separator;
      content += (flows[i]["ratings"] + separator);
      content += (flows[i]["featured"] + separator);
      content += ("\"" + getDateTimeString(flows[i]["created"]) + "\"") + separator;
      content += ("\"" + getDateTimeString(flows[i]["modified"]) + "\"") + separator;
      content += (flows[i]["uploadVersion"] + separator);
      content += (flows[i]["dataVersion"] + "\n");
    }
    return ContentService.createTextOutput(content);
  }
  if(e.parameter.format == "json") {
    return ContentService.createTextOutput(JSON.stringify(flows));
  }
  if(e.parameter.format == "chart") {
    return HtmlService.createTemplateFromFile("table").evaluate();
  }
}

function fetchFlows(user_id){
  var response = UrlFetchApp.fetch("https://llamalab.com/automate/community/api/v1/users/" + user_id + "/flows");
  var json_string = response.getContentText();
  CacheService.getScriptCache().put(user_id, json_string, 21600);
  return JSON.parse(json_string);
}
```

## Web Interface

The project provides three HTML files for its web interface:

### `readme.html`
This file serves as the landing page when no `user_id` is specified. It provides an introduction to the project, explains its purpose (fetching Automate flows), and includes an input field for the user to enter an Automate user ID. It dynamically generates URLs for viewing flow lists in HTML, JSON, CSV, and TSV formats.

### `index.html`
This HTML file is used to display the fetched Automate flows in a tabular format. It iterates through a `flows` variable (presumably populated by the server-side `doGet` function) and displays various details about each flow, such as `flow_id`, `user_id`, `flow_title`, `flow_description`, `ratings`, `created` date, etc.

### `table.html`
This HTML file appears to be intended for a more interactive display or charting of the flow data. It includes client-side JavaScript functions (`onload`, `onChangeUserId`, `fetchFlows`, `redrawTable`) to handle user input, fetch data using `google.script.run`, and potentially redraw a table. It uses `localStorage` to persist the user ID.

## Permissions

The `appsscript.json` manifest file specifies the following permissions and access settings:

*   **Web App Access:** `ANYONE_ANONYMOUS` - The web application can be accessed by anyone, even without a Google account.
*   **Web App Execution:** `USER_DEPLOYING` - The script runs under the identity of the user who deployed the web app. This means all actions performed by the script (e.g., `UrlFetchApp.fetch`) will be authorized by the deployer's account.
*   **Advanced Google Services:** None explicitly enabled.
*   **Libraries:** None explicitly used.

## Configuration

There is no explicit configuration section in `appsscript.json` or dedicated configuration files. The `fetchFlows` function directly constructs the API URL. The `readme.html` and `table.html` use `localStorage` for client-side persistence of the user ID.

## Deployments

The project has the following deployment:

*   **Deployment ID:** `AKfycbzPcLGsStrAq5Z6CFYXZINE-pYX9vb96Tqg_r8ALGs`
    *   **Target Version:** `HEAD`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbzPcLGsStrAq5Z6CFYXZINE-pYX9vb96Tqg_r8ALGs/exec`

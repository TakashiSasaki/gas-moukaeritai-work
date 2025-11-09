# Project: Multi-Stage Survey/Experiment Web Application

This Google Apps Script project is a web application designed for conducting complex multi-stage surveys or experiments. It features a multi-page web interface where user interactions, choices, rankings, and personal information are recorded into a designated Google Sheet for data collection and analysis.

## Overview

The primary purpose of this project is to facilitate research or data gathering through a structured, interactive online experience. It meticulously logs user responses and timestamps, providing a robust backend for quantitative analysis of experimental data.

## Functionality

The core functionality is implemented in `コード.js`, with the extensive user interface defined across numerous HTML files.

### Core Features

-   **`doGet()`**: Serves as the entry point for the web application. It records the current timestamp into a Google Sheet ("シート1") and then serves the main `index.html` template.
-   **Data Recording Functions**: A large number of `record...` functions are defined (e.g., `recordKojin`, `recordPchoice`, `recordPrank00`, `recordchoice01`, `recordrank01`, `recordbest01`, `recordrest01`). Each of these functions is responsible for:
    -   Opening a specific sheet within a hardcoded Google Sheet ID (`12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw`).
    -   Inserting a new row at the top of the sheet.
    -   Writing specific user input data (including timestamps, element IDs, values, and checked states) into that new row.
-   **HTML Content Retrieval**:
    -   `getNm()`: Returns the content of the "nm" HTML template.
    -   `getTr(cc)`: Reads data from the "物件" (property/item) sheet, filters it based on a given `cc` parameter, and then injects this data into the "tr" HTML template.

### Code Examples

#### `コード.js` (Excerpt)

```javascript
function doGet() {
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("シート1");
  var number_format = sheet.getRange(1,1).getNumberFormat();
  sheet.insertRowsBefore(1,1);
  var now = new Date();
  sheet.getRange(1,1,1,1).setValues([[now]]);
  sheet.getRange(1,1,1,1).setNumberFormat(number_format);
  var html_template = HtmlService.createTemplateFromFile("index");
  var html_output = html_template.evaluate();
  return html_output;
}
//個人情報の記録
function recordKojin(start_time,q1,q2,q3){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("Kojin");
  sheet.insertRowsBefore(1,1);
  var range = sheet.getRange(1,1,1,4);
  range.setValues([[start_time,q1,q2,q3]]);
}
//練習の選択結果の記録
function recordPchoice(start_time, start_pchoice, qestion, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("pchoice");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, start_pchoice, qestion, element_id, element_value, element_checked]]);
}
//練習の順位付け結果の記録
function recordPrank00(start_time, start_prank00,click_time, element_id, element_value, element_checked) {
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("prank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, start_prank00,click_time, element_id, element_value, element_checked]]);
}
// ... (many more record functions) ...
```

## Web Interface (`index.html` and numerous other HTML files)

The `index.html` file serves as the main entry point for a highly structured, multi-page web interface. It dynamically includes content from a large number of other HTML files, each representing a different stage or section of the survey/experiment.

-   **Multi-Stage Structure**: The extensive use of `display:none;` in the inline CSS for most sections, combined with client-side JavaScript functions like `show_hosoku2()`, `show_prank00()`, etc., indicates a sequential flow where different parts of the survey are revealed or hidden based on user progression.
-   **Input Types**: Various HTML elements are used for input, including radio buttons for gender/grade (`kojin.html`), text input for age (`kojin.html`), radio buttons for choices (`pchoice.html`), and dropdowns for rankings (`rank01.html`).
-   **Data Display**: Content from the "物件" (property/item) sheet is dynamically loaded into tables (`pchoice.html`, `rank01.html`) to present options to the user.
-   **Client-side Scripting**: JavaScript (including jQuery) handles user interactions, client-side validation (e.g., for age input, unique ranks), and calls server-side `record...` functions via `google.script.run` to log data.
-   **External Survey Link**: The page includes a link to an external Google Forms survey (`https://goo.gl/MtFDSv`).

### Example HTML Sections

-   **`kojin.html`**: Collects personal information (gender, age, grade).
-   **`pchoice.html`**: Presents a practice choice task with multiple options.
-   **`rank01.html`**: Presents a ranking task with dropdowns for users to assign ranks.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `ANYONE_ANONYMOUS` (the web app is accessible by anyone, even without a Google account).
-   **Google Services**: Implicitly uses `SpreadsheetApp` for reading and writing data to Google Sheets, and `HtmlService` for serving the web interface.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Hardcoded Spreadsheet ID**: All data is recorded into a single hardcoded Google Sheet with the ID `12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw`. This spreadsheet is expected to have multiple sheets named "シート1", "Kojin", "pchoice", "prank", "pbest", "choice", "rank", "best", "rest", and "物件".

## Deployments

The project is deployed as a web application. The following deployments are configured:

*   **Deployment ID**: `AKfycbwII4BHZbgpwPcEUc0iQu0Ks0OftjKwwn5zSO_skyQ`
    *   **Target**: `HEAD`
    *   **Description**: `(empty)`
*   **Deployment ID**: `AKfycbzeGbJwCa36rSEB60hvIiTQzkpqsjHVgxarhxvKpgFVzTHLZPQ`
    *   **Target**: `15`
    *   **Description**: `web app meta-version`

Specific deployment URLs would be available from the Google Apps Script project's deployment history.
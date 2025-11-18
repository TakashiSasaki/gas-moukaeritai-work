# Project: 1OFyuUHAA2lLSjmadG07uEnafWEoRj18X5FqpFk2Oi1Z0xtFXCKx7g0es

## Project Overview and Purpose

This Google Apps Script project is a web application designed to convert "kenqweb2" research activity data into CSV files suitable for import into "researchmap.jp". It provides a user-friendly interface that guides users through a six-step process: downloading an Excel file from kenqweb2, copying specific data, pasting it into a textarea, reviewing the parsed data, and finally downloading two CSV files (Japanese and English versions) for researchmap. The project leverages a `CsvParser` library for parsing tab-separated data and Google Charts for interactive data display.

## Core Functionality

The project's core functionality revolves around data conversion and presentation.

### Data Processing and Conversion (`submit.js`, `toCsv.js`)

*   **`cacheKenqwebRecords(kenqwebText)`**: Takes raw text (tab-separated values) from kenqweb2, parses it using `CsvParser.tsvDocument()`, and stores each row as a JSON string in the `UserCache`.
*   **`getKenqwebRecords()`**: Retrieves the cached records from `UserCache`.
*   **`kenqwebRecordToObject(kenqwebRecord)`**: Converts a single kenqweb2 record (array of strings) into a JavaScript object with Japanese keys (e.g., "発表区分", "演題・和文").
*   **`objectToResearchmapRecord(o)`**: Transforms the intermediate JavaScript object into a researchmap-compatible record (array of strings), mapping kenqweb2 fields to researchmap fields. It handles concatenation of author names and date formatting.
*   **`kenqwebRecordsToResearchmapRecords(kenqwebRecords, header)`**: Orchestrates the conversion of multiple kenqweb2 records into researchmap records, prepending a specified header.
*   **`kenqwebRecordsToResearchmapRecordsWithJapaneseHeader(kenqwebRecords)`**: Calls the above function with a predefined Japanese header for researchmap.
*   **`kenqwebRecordsToResearchmapRecordsWithEnglishHeader(kenqwebRecords)`**: Calls the above function with a predefined English header for researchmap.
*   **`recordsToDataObject(records)`**: Converts a 2D array of records into a Google Charts `DataObject` format, suitable for rendering interactive tables.
*   **`toCsv(records)`**: Converts a 2D array of records into a CSV formatted string, handling proper quoting and newlines.

```javascript
// Excerpt from submit.js
function cacheKenqwebRecords(kenqwebText) {
  var cache = CacheService.getUserCache();
  var records = CsvParser.tsvDocument(kenqwebText); // Uses external CsvParser library
  var count = 0;
  for(row in records) {
    cache.put(count, JSON.stringify(records[row]));
    count += 1;
  }
  return records.length;
}

// Excerpt from toCsv.js
/**
  @param {String[][]} records
  @returns {String[]}
*/
function toCsv(records) {
  var result = [];
  for(var i=0; i<records.length; ++i) {
    var record = records[i];
    if(record.length === 0) continue;
    for(var j=0; j<record.length-1; ++j) {
      result.push(JSON.stringify(record[j]));
      result.push(",");
    }
    result.push(JSON.stringify(record[record.length-1]));
    result.push("\n");
  }
  return result;
}
```

### Web App Entry Point (`doGet.js`)

*   **`doGet(e)`**: This function serves as the entry point for the web application.
    *   If `csvEnglish` or `csvJapanese` parameters are present, it generates and returns the corresponding CSV file for download.
    *   Otherwise, it renders the `index.html` file, setting the page title.

```javascript
function doGet(e) {
  if(e.parameter.csvEnglish){
    var records = getKenqwebRecords();
    records.unshift(englishHeader);
    var csv = toCsv(records);
    var text = csv.join("");
    var textOutput = ContentService.createTextOutput(text);
    textOutput.downloadAsFile("E06-English.csv");
    textOutput.setMimeType(ContentService.MimeType.CSV);
    return textOutput;
  }
  // ... (similar logic for csvJapanese) ...
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  var htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("kenqweb2 to researchmap CSV converter ");
  return htmlOutput;
}
```

### CSV/TSV Parsing Library (`bundle.js`, `bundle.js.html`)

The project includes a bundled JavaScript file (`bundle.js`) which contains a custom `require` implementation and a `Parsimmon`-based CSV/TSV parser. This parser is used to interpret the raw text pasted by the user.

*   **`CsvParser.tsvDocument(text)`**: Parses a TSV formatted string into a 2D array.
*   **`CsvParser.csvDocument(text)`**: Parses a CSV formatted string into a 2D array.

## Web Interface

The project's web interface is defined in `index.html`, `css.html`, `svgCopyButton.html`, and `svgExternalLink.html`.

### `index.html`

This HTML file presents the main user interface, guiding the user through the conversion process:

*   **Instructions:** Provides six steps with screenshots to guide the user.
*   **Input Area:** A `textarea` for pasting data copied from kenqweb2.
*   **Interactive Tables:** Uses Google Charts to display the parsed data in both Japanese and English formats, allowing users to review the conversion before downloading.
*   **Download Buttons:** Buttons to download the generated CSV files in Japanese and English, with options for researchmap and Excel compatibility.
*   **Client-side Logic:** JavaScript handles the `onChange` event of the textarea, calling server-side functions (`cacheKenqwebRecords`, `getDataObjectWithEnglishLabel`, `getDataObjectWithJapaneseLabel`) via `google.script.run` to process data and update the displayed tables. It also includes a `copyUrl()` function for the web app's short URL.

### `css.html`

Contains basic CSS styling for the web application, including styles for images, textareas, and step-by-step instructions.

### `svgCopyButton.html` and `svgExternalLink.html`

These files contain SVG icons for a copy-to-clipboard button and an external link indicator, respectively, used within `index.html`.

## Permissions

The `appsscript.json` manifest file specifies the following permissions and access settings:

*   **Time Zone:** `Asia/Tokyo`
*   **Exception Logging:** `STACKDRIVER`
*   **Runtime Version:** `V8`
*   **Dependencies:**
    *   **Libraries:**
        *   `CsvParser` (ID: `1lNnrAhYlTFhmxDlSI-HRypOATxNcsujO3hpUMK5MJTl-Ozt_CjRFE08c`, Version: `9`, Development Mode: `true`) - This indicates a dependency on an external Google Apps Script library for CSV/TSV parsing.
*   **Web App Access:** `ANYONE_ANONYMOUS` - The web application is accessible by anyone, even without a Google account.
*   **Web App Execution:** `USER_DEPLOYING` - The script runs under the identity of the user who deployed the web app.

## Configuration

The project uses `CacheService.getUserCache()` to temporarily store the parsed kenqweb2 records.

## Deployments

The project has the following deployments:

*   **Deployment ID:** `AKfycbyY7Ic4lNEEerYyEpoBwQd4QqxkpN9lcHfzOGub26EJ`
    *   **Target Version:** `HEAD`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbyY7Ic4lNEEerYyEpoBwQd4QqxkpN9lcHfzOGub26EJ/exec`

*   **Deployment ID:** `AKfycbxdw3BZaL_-41CpRKqwpu733q1O043YBo3fenkmII1fqtR7A6RB`
    *   **Target Version:** `15`
    *   **Description:** `web app meta-version`
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbxdw3BZaL_-41CpRKqwpu733q1O043YBo3fenkmII1fqtR7A6RB/exec`

```
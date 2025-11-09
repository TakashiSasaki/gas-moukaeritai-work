# Project: ChatGPT Mail Data Extractor

This Google Apps Script project is a web application designed to automate the extraction of data export links from ChatGPT notification emails in Gmail and organize them into a Google Sheet. It provides a simple web interface to access the generated spreadsheet.

## Overview

The primary purpose of this project is to help users keep track of their ChatGPT data exports. By automatically parsing specific emails and populating a Google Sheet with relevant information, it simplifies the process of managing and accessing these export files.

## Functionality

The core functionality is implemented across `doGet.js`, `index.html`, `getMails.js`, and `mailSpreadsheet.js`.

### Core Features

-   **`doGet()`**: This function serves as the entry point for the web application. It renders the `index.html` file.
-   **`getMails(year)`**: Searches the user's Gmail account for emails from `noreply@tm.openai.com` with the subject "Your data export is ready" within a specified `year`. It extracts the date of the message and the data export download URL from the email body.
-   **`updateMailSheet(year)`**: This function orchestrates the process of updating a Google Sheet. It retrieves the mail data using `getMails(year)`, clears the sheet for the specified year, and then populates it with the extracted dates and download URLs.
-   **`getMailSpreadsheet()`**: Locates or creates a Google Sheet named "Mails from ChatGPT" in a designated Google Drive folder. It stores the ID of this spreadsheet in user properties for persistent access.
-   **`getMailSheet(year)`**: Within the "Mails from ChatGPT" spreadsheet, this function retrieves or creates a sheet named after the `year` (e.g., "2023").
-   **`getMailSpreadsheetUrl()`**: Returns the URL of the "Mails from ChatGPT" Google Sheet.

### Code Examples

#### `getMails.js`

```javascript
function getMails(year) {
  if(year === undefined) year = 2023;
  const results = [];
  const threads = GmailApp.search(`from:noreply@tm.openai.com Your data export is ready after:${year}/1/1 before:${year}/12/31`);
  threads.forEach(thread=>{
   const messages = thread.getMessages();
    messages.forEach(message=>{
      const date = message.getDate();
      const body = message.getPlainBody();
      const m = body.match(/https:\/\/proddatamgmtqueue[a-zA-Z0-9%&=?.\/-]+/);
      results.push([date, m[0]]);
    });
  });
  console.log(results);
  return results;
}

function updateMailSheet(year){
  if(year === undefined) year = 2023;
  const s = getMailSheet(year);
  s.clear();
  const values = getMails(year);
  const range = s.getRange(1,1,values.length, 2);
  range.setValues(values);
}
```

#### `mailSpreadsheet.js`

```javascript
const mailSpreadsheetName = "Mails from ChatGPT";

function getMailSpreadsheet() {
  const folder = getFolder(); // Assumes getFolder() is defined elsewhere

  const mailSpreadsheetId = PropertiesService.getUserProperties().getProperty("mailSpreadheetId");
  if (mailSpreadsheetId instanceof String) {
    const mailSpreadsheet = SpreadsheetApp.openById(mailSpreadsheetId);
    return mailSpreadsheet;
  }//if

  var files = folder.getFilesByName(mailSpreadsheetName);
  const filesArray = [];

  while (files.hasNext()) {
    var file = files.next();
    if (file.getMimeType() === MimeType.GOOGLE_SHEETS) {
      filesArray.push(file);
    }
  }//while

  if (filesArray.length === 0) {
    Logger.log(`Google Sheets file "${mailSpreadsheetName}" not found in the folder "${folderName}".`);
    const spreadsheet = SpreadsheetApp.create(mailSpreadsheetName);
    DriveApp.getFileById(spreadsheet.getId()).moveTo(folder);
    PropertiesService.getUserProperties().setProperty("mailSpreadsheetId", spreadsheet.getId());
    return spreadsheet;
  }

  if (filesArray.length === 1) {
    PropertiesService.getUserProperties().setProperty("mailSpreadheetId", filesArray[0].getId());
    return SpreadsheetApp.open(filesArray[0]);
  }

  Logger.log(`Two or more Google Sheets file "${fileName}" found in the folder "${folderName}".`);
}//getMailSpreadsheet

function getMailSpreadsheetUrl(){
  const ss = getMailSpreadsheet();
  return ss.getUrl();
}
```

## Web Interface (`index.html`)

The `index.html` file provides a minimal web interface:

-   A hyperlink with the text "mailSpreadsheet".
-   Client-side JavaScript that dynamically fetches the URL of the "Mails from ChatGPT" spreadsheet using `google.script.run.getMailSpreadsheetUrl()` and sets it as the `href` attribute of the hyperlink.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `ANYONE` (the web app is accessible by anyone).
-   **Advanced Services**: `Drive API (v2)` is enabled, allowing the script to interact with Google Drive (e.g., creating and moving spreadsheets).
-   **Google Services**: Implicitly uses `GmailApp` for searching emails, `SpreadsheetApp` for spreadsheet manipulation, and `PropertiesService` for storing user properties.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **`mailSpreadsheetName`**: The name of the Google Sheet used to store mail data ("Mails from ChatGPT").
-   **`mailSpreadsheetId`**: The ID of the "Mails from ChatGPT" spreadsheet is stored in `PropertiesService.getUserProperties()`.
-   **`getFolder()`**: This function (not provided in the snippets) is assumed to return a Google Drive `Folder` object where the spreadsheet should be located.

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.

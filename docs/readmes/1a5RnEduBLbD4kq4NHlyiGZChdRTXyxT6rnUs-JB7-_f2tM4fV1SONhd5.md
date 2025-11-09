# Project: Send to Kindle from Google Drive

This Google Apps Script project is a web application designed to help users manage and potentially send PDF files from their Google Drive to Kindle. It provides a simple web interface to list PDF files found in the user's Google Drive root folder.

## Overview

The primary purpose of this project is to offer a convenient way to view PDF documents stored in Google Drive and, based on the application's title, facilitate sending them to a Kindle device. While the "send to Kindle" functionality is not fully detailed in the provided code, the application lays the groundwork for such a feature by listing available PDF files.

## Functionality

The core logic is implemented in `Code.js` and `getPdfInRoot.js`, with the user interface defined in `index.html`.

### Core Features

-   **`doGet()`**: This function serves as the entry point for the web application. It renders the `index.html` file, setting the page title to "Send to Kindle from Google Drive" and configuring the viewport for responsiveness.
-   **`getPdfInRoot(parentId)`**: This function searches for PDF files (`mimeType='application/pdf'`) within a specified Google Drive folder. If `parentId` is not provided, it defaults to searching the user's Google Drive root folder ("ROOT"). It returns an array of `File` objects.
-   **PDF File Listing**: The web interface is intended to display the names of the PDF files found in the root folder.

### Code Examples

#### `Code.js`

```javascript
function doGet() {
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  var htmlOutput = htmlTemplate.evaluate();
  htmlOutput.setTitle("Send to Kindle from Google Drive");
  htmlOutput.addMetaTag("viewport", "width=device-width, initial-scale=1");
  return htmlOutput;
}
```

#### `getPdfInRoot.js`

```javascript
function getPdfInRoot(parentId) {
  if(parentId === undefined) parentId = "ROOT";
  var x =DriveApp.searchFiles("parents in '" + parentId + "' and mimeType='application/pdf'");
  var files = [];
  while(x.hasNext()){
    var file = x.next();
    files.push(file);
  }
  return files;
}

function getPdfInRootTest(){
  var files = getPdfInRoot();
  Logger.log(files);
}
```

## Web Interface (`index.html`)

The `index.html` file provides a simple user interface:

-   **Folder ID Display**: An input field (`folderIdToMonitor`) displays "ROOT", indicating that the application currently monitors the root folder of Google Drive. This field is read-only.
-   **Reload Button**: A button labeled "Reload" is present, which is intended to trigger a client-side function (`reload()`) that calls a server-side function (`getPdfFiles()`, likely a wrapper around `getPdfInRoot`) to fetch and display the list of PDF files.
-   **PDF Files Display**: A `div` with the ID `pdfFiles` is where the names of the discovered PDF files are meant to be displayed.
-   **Client-side Script**: The embedded JavaScript handles the `reload` functionality and includes a placeholder for a "send to Kindle" action button for each listed PDF.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `MYSELF` (the web app is accessible only by the user who deployed it). This is appropriate given it interacts with the user's personal Google Drive files.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Dependencies**: No external libraries or advanced services are explicitly listed in `appsscript.json`. The project implicitly uses `DriveApp` for file access.

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.

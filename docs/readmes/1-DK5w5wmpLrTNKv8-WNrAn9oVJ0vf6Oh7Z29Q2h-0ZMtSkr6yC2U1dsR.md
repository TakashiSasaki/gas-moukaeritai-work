# Project: URL Bookmark Parser

This Google Apps Script project is a specialized parser for Netscape-style HTML bookmark files.

## Overview

The primary purpose of this script is to read an HTML file formatted as a bookmark export (`example.html`) and parse its hierarchical structure. It uses the `parsimmon.js` library, a parser combinator library included directly in the project, to define a grammar that matches the bookmark file's structure.

## Functionality

The core logic resides in the `myFunction` within `Code.js`.

-   **Reading the Data File**: The script begins by reading the content of `example.html`, which serves as the data source.
-   **Parsing Logic**: It defines a detailed grammar using `Parsimmon` to recognize and structure the elements of the bookmark file, such as folders (`<H3>`), bookmarks (`<A>`), and their nested structure within `<DL>` lists.
-   **Output**: After parsing the entire file, the script iterates through the extracted structure of pages, folders, and bookmarks, and logs them to the Apps Script console.

```javascript
function myFunction() {
  const x = HtmlService.createHtmlOutputFromFile("example");
  const text = x.getContent();
  
  // ... Parsimmon grammar definition ...

  const All = P.seq(Header, H1Parser, DlStart, Page.many(), DlEnd);

  const result = All.tryParse(text);
  const pages = result[3];

  result[3].forEach(page=>{
    console.log(`Page: ${page[1][1][0]}`);
    page[3].forEach(folder=>{
      console.log(`Folder: ${folder[1][1][0]}`);
      folder[3].forEach(bookmark=>{
        console.log(`Bookmark: ${bookmark[1][0][0]}`);
      });
    });
  });
}
```

## Included Library: Parsimmon

The project includes the `parsimmon.js` file, which is a third-party parser combinator library for JavaScript. This library is essential for the script's functionality, providing the tools to build the bookmark file parser.

## Web Interface

This project does not have a web interface. The `example.html` file is used as a data input file, not as a UI. This is confirmed by the absence of a `webapp` configuration in `appsscript.json`.

## Permissions

As this is a standalone script, permissions are managed through the Google Apps Script editor. Users with sufficient permissions can execute the `myFunction` manually to trigger the parsing process.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.

## Deployments

The project has the following deployment:

-   **Deployment ID**: `AKfycbwCim2FBm97ZnboxZ-SVO-sig218UBNspToMPdfkk7Q`
    -   **Target**: `@HEAD`
    -   **Description**: _(none)_
    -   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbwCim2FBm97ZnboxZ-SVO-sig218UBNspToMPdfkk7Q/exec)
        (Note: As this project is not a web app, this URL will not lead to a user interface.)

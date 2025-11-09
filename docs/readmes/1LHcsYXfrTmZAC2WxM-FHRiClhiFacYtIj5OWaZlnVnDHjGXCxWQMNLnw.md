# Mozilla PDF.js in Google Apps Script

## Overview

The "Mozilla PDF.js" project is a Google Apps Script web application that demonstrates the integration and usage of the Mozilla PDF.js library within the Google Apps Script environment. Its primary purpose is to parse PDF files from a given URL, extract various metadata and content, and store this information in the Google Apps Script user cache. This allows for programmatic access and analysis of PDF document properties and text content. The application provides a basic web interface for users to input PDF URLs.

## Functionality

The project enables the parsing of PDF documents and the extraction of their structural and textual data.

### Core Features

-   **`doGet()`:** The entry point for the web application. It creates an HTML output from `index.html` and sets the page title to "Mozilla PDF.js in Google Apps Script".
-   **`parse(uint8Array)`:** This asynchronous server-side function is the core PDF processing logic.
    -   It takes a `Uint8Array` representing the PDF file's binary content.
    -   It calculates an MD5 hash of the PDF content for caching purposes.
    -   It uses `pdfjsLib.getDocument()` to load the PDF and then extracts various properties:
        -   `pdfFormatVersion`
        -   `stats` (document-level)
        -   `numPages`
        -   `fingerprint`
        -   `pageLayout`
        -   `pageLabels`
        -   `pageMode`
        -   `viewerPreferences`
    -   For each page, it extracts:
        -   `viewport`
        -   `annotations`
        -   `textContent`
        -   `pageNumber`
        -   `rotate`
        -   `ref`
        -   `userUnit`
        -   `view`
        -   `stats` (page-level)
    -   All extracted data is stored in the `UserCache` using the `put_` function.
-   **`put_(md5, page, key, value)`:** A helper function to store data in the `UserCache`. It constructs a cache key based on the PDF's MD5 hash, page number (if applicable), and the data key, storing the `value` for 6 hours (21600 seconds).
-   **`fetch(url)` (in `sample.js`):** A utility function to fetch binary content from a URL and cache it in the `ScriptCache`. This is used to retrieve sample PDF files.
-   **Sample PDF Data (`sample.js`):** Contains predefined `Uint8Array` variables (`SAMPLE1`, `SAMPLE2`, `SAMPLE3`, `SAMPLE4`) with base64-decoded PDF content or fetched from external URLs, used for testing the `parse` function.
-   **User Interface (`index.html`):** Provides a simple input field for a PDF URL and a button to trigger the text extraction process. The extracted text is displayed in a `textarea`.

### Code Examples

#### `doGet.js`

```javascript
function doGet() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile("index");
  htmlOutput.setTitle("Mozilla PDF.js in Google Apps Script");
  return htmlOutput;
}
```

#### `parse.js` (Core parsing logic)

```javascript
async function parse(uint8Array) {
  if (typeof uint8Array === "undefined") uint8Array = SAMPLE4;
  const md5 = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, uint8Array));
  console.log(md5);
  const cache = CacheService.getUserCache();
  
  const pdfDocumentProxy = await pdfjsLib.getDocument({
    data: uint8Array, 
    nativeImageDecoderSupport:"none", 
    disableNativeImageDecoder:true
  }).promise;
  
  const metadata = await pdfDocumentProxy.getMetadata();
  put_(md5, undefined, "pdfFormatVersion", JSON.stringify(metadata.info.PDFFormatVersion));
  // ... (other metadata and page-level data extraction and caching) ...
}
```

#### `put_.js`

```javascript
function put_(md5,page,key,value){
  if(typeof value != "string") throw new Error("value is " + typeof value);
  const cache = CacheService.getUserCache();
  if(typeof page != "number") {
    const cacheKey = md5 + key;
    cache.put(cacheKey, value, 21600);
    console.log(cacheKey + ": " + value);
  } else {
    const cacheKey = md5 + page + "-" + key;
    cache.put(cacheKey, value, 21600);
    console.log(cacheKey + ": " + value);
  }
}
```

## Permissions

The `appsscript.json` file indicates no specific library dependencies. The web application is configured to execute as the user who deployed it and is accessible by anyone anonymously.

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

-   **ID (HEAD):** `AKfycbwvk9iyqrAM-nsANeqnDFZQmLno90n7NlpgJTZ3WX4e`
    -   **URL:** `https://script.google.com/macros/s/AKfycbwvk9iyqrAM-nsANeqnDFZQmLno90n7NlpgJTZ3WX4e/exec`
-   **ID (Version 2 - web app meta-version):** `AKfycbwU7Hprc1Y2Xr-I2ofsHYmi_Zo94Nbe_2cSWFSTurafxNPosoFa`
    -   **URL:** `https://script.google.com/macros/s/AKfycbwU7Hprc1Y2Xr-I2ofsHYmi_Zo94Nbe_2cSWFSTurafxNPosoFa/exec`

# Project: 1-oFq3B2G4PgnzCmmXpxiOO8JIUOHXoSO7lnKyUSZB_EJb8rA2OGzypw2

This Google Apps Script project appears to be a script for interacting with the Japan Battery Recycling Center (JBRC) website.

## Overview

The script contains a single function that sends a POST request to a URL on the `jbrc-sys.com` domain. The nature of the request suggests it is intended to navigate through a paginated list of search results on the JBRC website.

## Functionality

The core logic is contained in the `myFunction` within `Code.js`.

-   **HTTP Request**: The function uses `UrlFetchApp.fetch()` to send a POST request.
-   **Target URL**: The request is sent to `https://www.jbrc-sys.com/brsp/a2A/@!a2pr_getpage`.
-   **Payload**: The payload includes parameters for pagination, such as `a2PagingCommand: "next"` and `a2PagingOffset: 15`, indicating it is designed to fetch the next page of a search result.

```javascript
function myFunction() {
  const url = "https://www.jbrc-sys.com/brsp/a2A/@!a2pr_getpage";
  const options = {
    method : "POST",
    contentType: "application/x-www-form-urlencoded",
    followRedirects: true,
    payload: {
      a2PagingCommand :"next",
      a2PagingOffset : 15,
      a2PagingProperty : "SEARCH_RESULT",
      a2PagingContinueFg:false
    }
  };
  const result = UrlFetchApp.fetch(url, options);
}
```

## Web Interface

This project is not a web application, as it lacks a `webapp` configuration in its `appsscript.json` file. It is a standalone script intended to be run directly from the Apps Script editor.

## Permissions

As a standalone script, permissions are managed through the Google Apps Script editor. Users with editor access can execute the `myFunction` manually.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.

## Deployments

The project has the following deployment:

-   **Deployment ID**: `AKfycbyqINwMJzirx1un8N5m5Ckn4EXEkD_332gMH7_W0hvy`
    -   **Target**: `@HEAD`
    -   **Description**: _(none)_
    -   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbyqINwMJzirx1un8N5m5Ckn4EXEkD_332gMH7_W0hvy/exec)
        (Note: As this project is not a web app, this URL will not lead to a user interface.)

# DriveMetaViewer

## Overview

This Google Apps Script project, "DriveMetaViewer," is a Google Drive add-on that allows users to view detailed metadata for any selected file in their Drive. When a user selects a file and activates the add-on, it displays a comprehensive card with various pieces of information about that file.

## Functionality

The core of this add-on is the `onDriveItemsSelected` trigger, which is fired when a user selects one or more items in Google Drive and invokes the add-on.

### Core Features

- **`onDriveItemsSelected(e)`:** This is the main function that runs when the add-on is triggered. It gets the ID of the selected file and uses the `getDriveMetadataViaV3` function to fetch the file's metadata.
- **`getDriveMetadataViaV3(fileId)`:** This function makes a call to the Drive API v3 to get all available metadata for the given `fileId`.
- **Metadata Display:** The add-on creates a card using the `CardService` that displays the following information:
    - File ID, Name, MIME Type, Created Time, Modified Time, Size
    - MD5, SHA-1, and SHA-256 Checksums
    - Parent folders, Starred status, Shared status
    - A set of buttons for any available `exportLinks`
    - The raw JSON response from the Drive API

### Code Examples

#### `Code.js`
```javascript
function onDriveItemsSelected(e) {
  const fileId = e.drive.selectedItems[0].id;
  const file = getDriveMetadataViaV3(fileId);

  // ... (code to extract metadata and build the card)

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("Selected File Metadata"))
    .addSection(
      CardService.newCardSection()
        .addWidget(CardService.newTextParagraph().setText(`<b>File ID:</b> ${fileId}`))
        // ... (widgets for other metadata)
    )
    .build();

  return [card];
}

function getDriveMetadataViaV3(fileId) {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=*`;
  const options = {
    method: "get",
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`
    },
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}
```

## Permissions

The `appsscript.json` file specifies the necessary OAuth scopes for this add-on to function, including read-only access to Drive metadata. It also whitelists the Drive API endpoint.

```json
{
  "timeZone": "Asia/Tokyo",
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/drive.addons.metadata.readonly",
    "https://www.googleapis.com/auth/script.locale",
    "https://www.googleapis.com/auth/drive.readonly"
  ],
  "urlFetchWhitelist": [
    "https://www.googleapis.com/drive/v3/files"
  ],
  "addOns": {
    "common": {
      "name": "DriveMetaViewer",
      "logoUrl": "https://i.gyazo.com/275563f7aaacb571867ccb1b7ce2e385.png",
      "useLocaleFromApp": true
    },
    "drive": {
      "onItemsSelectedTrigger": {
        "runFunction": "onDriveItemsSelected"
      }
    }
  }
}
```

## Deployments

The project has multiple deployments:

- **ID (HEAD):** `AKfycbz0tGS5dHmtfLcQIjZHepmo_68tm8GiNsM8jGFrR9Ka`
  - **URL:** `https://script.google.com/macros/s/AKfycbz0tGS5dHmtfLcQIjZHepmo_68tm8GiNsM8jGFrR9Ka/exec`
- **ID (Version 6):** `AKfycbyrE4kNWcyxNJt02TCZQucRU9uBWgT7WG4LWM74OaoJFsXloyAIwaoqn7MUEMPg7IDkNA`
  - **URL:** `https://script.google.com/macros/s/AKfycbyrE4kNWcyxNJt02TCZQucRU9uBWgT7WG4LWM74OaoJFsXloyAIwaoqn7MUEMPg7IDkNA/exec`
- **ID (Version 5):** `AKfycbzGfMC0UjH5KMVBl6r0MIqJ6q6L07lXCTzfYfeRTq15GsURtP0j2_7eX5fIUFMEhE3Pdw`
  - **URL:** `https://script.google.com/macros/s/AKfycbzGfMC0UjH5KMVBl6r0MIqJ6q6L07lXCTzfYfeRTq15GsURtP0j2_7eX5fIUFMEhE3Pdw/exec`
- **ID (Version 4):** `AKfycbx3lIRAX4p-LjrKL6o5Ys22_wNjPtJYh2wHS3b74oRUOFM43C3G7Ahlpr-kfI_YUtLMwA`
  - **URL:** `https://script.google.com/macros/s/AKfycbx3lIRAX4p-LjrKL6o5Ys22_wNjPtJYh2wHS3b74oRUOFM43C3G7Ahlpr-kfI_YUtLMwA/exec`

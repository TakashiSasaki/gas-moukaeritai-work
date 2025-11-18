# DocImageResizer

## Overview

This Google Apps Script project, "DocImageResizer," is an add-on for Google Docs. It provides functionality to resize inline images within a Google Document to a specified maximum height and to move images to either the top or bottom of the document. It uses the CardService to present a user interface within the Google Docs sidebar.

## Functionality

The add-on provides a user interface in the Google Docs sidebar with options to resize images and move them.

### Core Features

- **`onHomepage(e)`:** This function is triggered when the add-on is opened and displays the main card with input fields and buttons for user interaction.
- **`resizeImages(e)`:** Resizes images in the active document. If a selection is active, it only resizes images within the selection; otherwise, it processes all images in the document body. Images with a height less than or equal to the target height are ignored.
- **`resizeImagesInElement(element, targetHeight)`:** A recursive helper function that traverses document elements and resizes inline images if their height exceeds `targetHeight`.
- **`moveImagesToTop()`:** Moves all identified inline images to the top of the document.
- **`moveImagesToBottom()`:** Moves all identified inline images to the bottom of the document.
- **`moveImagesToPosition(position)`:** A common helper function used by `moveImagesToTop` and `moveImagesToBottom` to handle the logic of moving images.
- **`collectImages(element, imagesArray)`:** A recursive helper function to find and collect all inline image elements within a given document element.

### Code Examples

#### `Code.js`
```javascript
// onHomepage: Displays a card with input and buttons
function onHomepage(e) {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("DocImageResizer"))
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph().setText(
            "Enter the target height in pixels. Images with a height less than or equal to the target will be ignored."
          )
        )
        .addWidget(
          CardService.newTextInput()
            .setFieldName("targetHeight")
            .setTitle("Target Height (px)")
            .setHint("e.g., 200")
            .setValue("200")
        )
        .addWidget(
          CardService.newTextButton()
            .setText("Resize images")
            .setOnClickAction(CardService.newAction().setFunctionName("resizeImages"))
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        )
        .addWidget(
          CardService.newButtonSet()
            .addButton(CardService.newTextButton()
              .setText("Move images to top")
              .setOnClickAction(CardService.newAction().setFunctionName("moveImagesToTop")))
            .addButton(CardService.newTextButton()
              .setText("Move images to bottom")
              .setOnClickAction(CardService.newAction().setFunctionName("moveImagesToBottom")))
        )
    )
    .build();
}

// Resize images in selection if any, otherwise entire doc
function resizeImages(e) {
  var targetHeight = parseInt(e.formInputs.targetHeight[0], 10) || 200;
  var selection = DocumentApp.getActiveDocument().getSelection();

  if (selection) {
    var elements = selection.getRangeElements();
    elements.forEach(function(rangeElement) {
      resizeImagesInElement(rangeElement.getElement(), targetHeight);
    });
  } else {
    var body = DocumentApp.getActiveDocument().getBody();
    resizeImagesInElement(body, targetHeight);
  }

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("DocImageResizer"))
    .addSection(CardService.newCardSection().addWidget(
      CardService.newTextParagraph().setText("Images resized successfully.")))
    .build();
}
```

## Permissions

The `appsscript.json` file specifies the necessary OAuth scopes for this add-on to function, including access to Google Docs, the ability to create a UI, and access to script locale information.

```json
{
  "timeZone": "Asia/Tokyo",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/script.container.ui",
    "https://www.googleapis.com/auth/script.locale"  
  ],
  "addOns": {
    "common": {
      "name": "DocImageResizer",
      "logoUrl": "https://daigakujc.jp/sys_img/00777_u.png",
      "useLocaleFromApp": true,
      "openLinkUrlPrefixes": [
        "https://"
      ]
    },
    "docs": {
      "homepageTrigger": {
        "runFunction": "onHomepage"
      }
    }
  }
}
```

## Deployments

The project has two deployments:

- **ID (HEAD):** `AKfycbzWYEwF7XNW88FmRztXgoPkkL8ott0fatPL9pcesgQ2`
  - **URL:** `https://script.google.com/macros/s/AKfycbzWYEwF7XNW88FmRztXgoPkkL8ott0fatPL9pcesgQ2/exec`
- **ID (Version 4):** `AKfycbxf7CNT5eUSv9z7Fx-N5WkpM8iwBjVQPnR8tfubQ6cjr_NdpMkT8XtKY1dNGN_CpNjNtA`
  - **URL:** `https://script.google.com/macros/s/AKfycbxf7CNT5eUSv9z7Fx-N5WkpM8iwBjVQPnR8tfubQ6cjr_NdpMkT8XtKY1dNGN_CpNjNtA/exec`

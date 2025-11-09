# Docs Headings Addon

## Overview

This Google Apps Script project, "Docs Headings Addon," is an add-on for Google Docs that provides tools for analyzing the structure of a document. It can inspect the headings, paragraphs, and other elements within a document and display information about them in a sidebar.

## Functionality

The add-on adds a menu to the Google Docs UI with options to "showChildren" and "showGroups." These options open a sidebar that displays information about the document's structure.

### Core Features

- **`onOpen()`:** Creates the add-on menu in the Google Docs UI.
- **`showChildren()` and `showGroups()`:** These functions open a sidebar to display information about the document's elements.
- **`scanBodyChildren()`:** The main function for analyzing the document. It calls other functions to get all the children of the document body, group them by heading, and extract numbers.
- **`getBodyChildren()`:** Iterates through all the child elements of the document body (paragraphs, lists, tables, etc.) and collects information about their type and content.
- **`getHeadings()`:** Specifically retrieves all paragraphs and identifies their heading level (e.g., HEADING1, HEADING2, TITLE).

### Code Examples

#### `Code.js`
```javascript
function onOpen() {
  reloadAddonMenu();
}

function reloadAddonMenu() {
  const ui = DocumentApp.getUi();
  ui.createAddonMenu()
    .addItem("reloadAddonMenu", "reloadAddonMenu")
    .addItem("showChildren", "showChildren")
    .addItem("showGroups", "showGroups")
    .addToUi();
}

function scanBodyChildren() {
  //var headings = getHeadings();
  bodyChildren = getBodyChildren();
  groupByHeading(bodyChildren);
  groupByHeadingOrBlank(bodyChildren);
  extractNumbers(bodyChildren);
  return bodyChildren;
}//scanBodyChildren
```

#### `getBodyChildren.js`
```javascript
function getBodyChildren() {
  const body = DocumentApp.getActiveDocument().getBody();
  const a = [];
  for (var i = 0; i < body.getNumChildren(); ++i) {
    const child = body.getChild(i);
    const o = {
      index: i,
      type: child.getType().toString()
    }
    // ... (code to handle different element types)
    a.push(o);
  }//for
  return a;
}//getBodyChildren
```

## Permissions

The `appsscript.json` file specifies the necessary OAuth scopes for this add-on to function, including access to the current document and the ability to create a UI. It also enables the Google Docs API (Advanced Service).

```json
{
  "timeZone": "Asia/Tokyo",
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.container.ui",
    "https://www.googleapis.com/auth/documents.currentonly",
    "https://www.googleapis.com/auth/documents"
  ],
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Docs",
        "version": "v1",
        "serviceId": "docs"
      }
    ]
  },
  "addOns": {
    "common": {
      "name": "Docs Sort Add-on",
      "logoUrl": "https://1.bp.blogspot.com/-xPEFG68z1CU/VwqZQUKSzLI/AAAAAAAAUbY/G2prHnMW45EHK6TxCnhzC7da-HPg9kQww/s1600/sort-docs-postpic.png"
    },
    "docs": {}
  }
}
```

## Deployments

The project has two deployments:

- **ID (HEAD):** `AKfycbw-ntLrWW9s6k5_MQX9ZpmLJvf5-CSSogQfMAyOxOaM`
  - **URL:** `https://script.google.com/macros/s/AKfycbw-ntLrWW9s6k5_MQX9ZpmLJvf5-CSSogQfMAyOxOaM/exec`
- **ID (Version 1):** `AKfycbzf_HlO0hdFtbnPVqfpprD10MMsKJ2dyDE-rZoC06yAyu8thdB9n8-4FrAGAJZ6RdcXQA`
  - **URL:** `https://script.google.com/macros/s/AKfycbzf_HlO0hdFtbnPVqfpprD10MMsKJ2dyDE-rZoC06yAyu8thdB9n8-4FrAGAJZ6RdcXQA/exec`

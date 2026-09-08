# read-only-datastore-admin

## Overview

The current checked-in implementation is a very small Google Apps Script Web App that lists Google Sheets files located in the first Google Drive folder named `gas`.

The project name suggests a read-only Datastore administration tool, but **the source currently contains no Google Cloud Datastore/Firestore API access or administration logic**. This README describes the implementation that is actually present rather than inferring behavior from the project name.

## Current behavior

On each `doGet(e)` request the script:

1. Searches Drive for folders named `gas`.
2. Uses the first matching folder, if one exists.
3. Enumerates Google Sheets files directly inside that folder.
4. Passes each spreadsheet's name and URL to the `index` HTML template.
5. Renders a page titled `Google Drive Spreadsheet List`.

The implementation is read-only with respect to the listed spreadsheets; it does not modify them.

## Main source

- `gas/Code.js` — Drive folder/spreadsheet enumeration and Web App rendering.
- `gas/index.html` — presentation template, when present in the materialized project.

If Datastore administration features are added later, this README should be updated to describe the new API, permissions, and read-only guarantees explicitly.
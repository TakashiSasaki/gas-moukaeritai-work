# 1ZKdRjD7_vTfM1WdztdpTZATzOwvO8cWg5sZcDBgfdHAjny_DXH2sK3Zk

## Overview
This document provides an overview of the Google Apps Script project with Script ID `1ZKdRjD7_vTfM1WdztdpTZATzOwvO8cWg5sZcDBgfdHAjny_DXH2sK3Zk`.

## Functionality
This Google Apps Script project is a Spreadsheet Add-on designed to manage Gmail labels and threads directly from Google Sheets. Its core functionalities include:
- **Add/Remove Labels:** Users can add or remove Gmail labels from threads based on specified search queries or existing labels within the spreadsheet.
- **Create Labels:** New Gmail labels can be created using values from active spreadsheet cells.
- **Rename Labels:** Threads can be moved from a source label to a destination label, effectively allowing for label renaming.
- **Count Threads:** The script can count Gmail threads associated with specific labels or search queries and write these counts back to the spreadsheet.
- **Get Last Message Date:** It can retrieve the last message date of threads matching a given query and record it in the spreadsheet.
- **List Labels:** All existing Gmail user label names can be listed and written to the spreadsheet.
- **Delete Labels:** Gmail labels can be deleted based on a corresponding zero count in the spreadsheet.
- **Spreadsheet Integration:** The script heavily interacts with Google Sheets for reading input data and writing results.

## Web Interface
The project provides a web interface (sidebar) within Google Sheets, which contains buttons to trigger the various Gmail and spreadsheet manipulation actions. The `doGet()` function serves the `index.html` file, which forms this user interface.

## Permissions
This script requires the following permissions:
- Access to Google Sheets (to read and write data).
- Access to Gmail (to manage labels and threads).
- Access to user properties (to store and retrieve the active spreadsheet ID).

## Configuration
- The script utilizes user properties to store the ID of the active spreadsheet.
- It depends on an external library named "SpreadsheetAddon" with `libraryId`: `1LSYokZ_LmtIkXv-URsN99givIHlIkDNHwQjkLAo6JkzwLvsbagpdbTaE`.

## Deployments
This project is deployed as a web application and is intended to function as a Google Sheets Add-on.

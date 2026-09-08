# Googleドライブ内文書一覧

## Overview

This Google Apps Script Web App inventories document-like files in Google Drive and writes the results to a date-stamped sheet in a dedicated Google Spreadsheet. It is designed to handle large result sets incrementally from the browser instead of trying to enumerate everything in a single Apps Script execution.

## Files included

The current search targets Google Docs, Google Slides, PDFs, Microsoft Word/PowerPoint files, plus `.txt` and `.md` files. Results include the file name, URL, Drive file ID, and last-modified timestamp.

## Processing flow

1. `startProcessing()` opens or creates the output spreadsheet and prepares a sheet named `yyyy-MM-dd`.
2. `processNextPage(metaData)` calls the Advanced Drive service for one page of results and appends matching files to the sheet.
3. The client repeats the page operation while a `nextPageToken` remains.
4. `finalizeProcessing()` completes the run and sorts the date-named sheets.

The spreadsheet ID is stored in User Properties under `DOC_LIST_SPREADSHEET_ID` so later executions reuse the same output workbook when possible.

## Reliability

Drive listing uses pages of up to 500 files and retries transient Drive/API quota failures up to five times with exponential backoff plus jitter. Filtering is repeated after retrieval so `.txt` and `.md` matches are validated by their actual filename suffix.

## Requirements

The project requires the Advanced Drive service (Drive API v3). `gas/doGet.js` and `gas/index.html` provide the Web App entry point and browser-side progress UI.

This tool builds an inventory; it does not modify the Drive files being listed.
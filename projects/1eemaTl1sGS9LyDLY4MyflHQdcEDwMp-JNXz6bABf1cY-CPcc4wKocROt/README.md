# rename-by-gemini

## Overview

This Google Apps Script Web App reviews files in a selected Google Drive folder, asks Gemini to suggest concise filenames from file contents, and lets the user rename files in bulk/individually from the browser UI.

## Features

- Stores the user's Gemini API key in User Properties.
- Remembers the selected Drive folder and filename-filter settings per user.
- Lists files in a folder, newest first.
- Retrieves Drive thumbnail links through the Advanced Drive service and caches thumbnail data URLs.
- Generates filename suggestions with Gemini and caches suggestions for 600 seconds.
- Supports Google Docs, plain text/Markdown, and PDF inputs for title generation.
- Sends PDFs to Gemini as inline PDF data; text documents are truncated to the first 5,000 characters.
- Preserves an existing filename extension when applying a generated basename.

## Gemini configuration

The current implementation calls `gemini-2.0-flash-lite` through the Generative Language API. The API key is stored as `GEMINI_API_KEY` in **User Properties**, allowing different Web App users to configure their own key.

Generated titles are requested as Japanese phrases of at most 25 characters, emphasizing important keywords, dates, project names, or other identifying content.

## Drive mutations

`renameFile(fileId, newName)` calls `DriveApp.getFileById(fileId).setName(...)`. Renaming is therefore a real Drive mutation; review generated suggestions before applying them when filename stability matters.

## Main implementation

`gas/Code.js` contains the server-side preference, Drive, thumbnail, Gemini, cache, and rename logic. The HTML assets provide the interactive Web App interface.
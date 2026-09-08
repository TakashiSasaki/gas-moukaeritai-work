# Web Clip Stash

## Overview

Web Clip Stash is a Google Apps Script Web App for triaging older files in the root of My Drive. It identifies candidate Google Docs, PDFs, and text files, uses deterministic Gemini classification to decide whether a file looks suitable for archival, and can move selected files into a dedicated stash folder.

## Candidate selection

The current configuration:

- scans only files directly under the My Drive root;
- ignores trashed files;
- considers Google Docs, PDFs, and plain-text files;
- excludes files updated within the last **7 days** as a safety window;
- limits accepted candidates and returned results, but does not bound the total number of inspected files;
- only processes files owned by the active user.

Files rejected by ownership or age checks do not increment the candidate counter. A large Drive root may therefore require traversing the entire matching iterator and can exceed the Apps Script execution limit.

## KEEP/MOVE classification

Before calling Gemini, filenames are checked against a user-configurable keep-keyword list. Matching files are forced to `KEEP`.

Other candidates are sent to `gemini-2.5-flash-lite`. Text content is truncated to 8,000 characters; non-text content is sent as inline binary data. Gemini requests use `temperature: 0.0` to reduce classification variability.

Set `GEMINI_API_KEY` in Script Properties before using AI classification.

## Moving files

`moveFilesBatch()` moves selected files to `_Web_Clip_Stash`. If that folder does not exist, the application creates it, adds a descriptive folder note, and attempts to create a `00_READ_ME (About Web Clip Stash)` Google Doc inside it.

Moving is a real Drive mutation and is not automatically reversible by this script.

## Configuration

`gas/Config.js` defines the model, seven-day safety window, destination folder, checked tag, and default KEEP keywords. User-customized KEEP keywords are stored in User Properties.

`gas/Code.js` implements candidate discovery, AI classification, content extraction, and file moves; `gas/index.html` provides the Web App UI.
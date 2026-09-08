# Markdown converter

## Overview

This Google Apps Script Web App extracts text from files selected in Google Drive. Despite the project name, the current implementation is primarily a **plain-text extraction tool**, not a full document-to-Markdown converter.

## Supported inputs

- **Google Docs:** returns `DocumentApp.getBody().getText()`.
- **Google Slides:** extracts text shapes from each slide and adds simple Markdown-like slide headings and separators.
- **PDF:** temporarily converts the PDF to a Google Docs document with Drive API OCR, extracts the text, and trashes the temporary conversion.

The built-in Drive picker exposes folders and only the supported file types.

## Web App flow

`doGet()` serves the `index` UI. The browser passes a selected Drive file ID to `callExtractMarkdown(fileId)`, which dispatches to the appropriate extraction implementation based on MIME type.

## Important limitations

- Google Docs formatting such as bold, lists, tables-as-structure, and rich text is not preserved; only text is returned.
- Slides preserve only text content and coarse slide boundaries.
- PDF extraction depends on OCR quality.
- PDF processing uses methods from the Advanced Drive service compatible with the Drive API v2 interface (`Drive.Files.insert` / `Drive.Files.trash`). The source explicitly reports an error when these methods are unavailable.
- Temporary OCR documents are moved to trash after successful extraction.

The project is therefore best understood as a Drive text-extraction utility whose output can be used as source material for Markdown, rather than as a high-fidelity Markdown serializer.
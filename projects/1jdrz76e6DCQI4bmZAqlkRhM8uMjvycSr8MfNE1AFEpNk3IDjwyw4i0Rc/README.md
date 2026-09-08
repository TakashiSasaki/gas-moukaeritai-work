# Docsタイトル提案アドイン

## Overview

This Google Workspace Add-on generates candidate titles for the active Google Docs document with the Gemini API and lets the user apply a selected title directly to the document.

## Features

- Reads text from the active Google Docs document.
- Sends up to the first 30,000 characters to Gemini.
- Generates five title candidates for interactive selection.
- Provides an `お任せ` action that generates one candidate and immediately applies it.
- Lets the user select a generation temperature from 0.1 to 1.0.
- Displays the prompt used for the Gemini request.
- Renames the active document with `Document.setName()` after the user chooses a title.

## Gemini configuration

The current source calls the Gemini Generative Language API directly with `UrlFetchApp` and uses:

- API version: `v1beta`
- Model: `gemini-2.5-flash-preview-09-2025`
- Script Property: `GEMINI_API_KEY`

The API key must be stored in Script Properties before the add-on can generate titles.

## Add-on flow

`onHomepage(e)` builds the initial CardService UI and automatically generates suggestions when an accessible non-empty document is open. `generateAction(e)`, `quickApplyAction(e)`, and `applyAction(e)` handle regeneration and title application.

The implementation is a Google Workspace Add-on, not a standalone text-generation library; it expects an active Google Docs context.
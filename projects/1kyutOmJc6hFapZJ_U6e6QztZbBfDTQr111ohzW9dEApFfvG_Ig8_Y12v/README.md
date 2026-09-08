# Docs to Blogger Publisher

## Overview

This Google Apps Script web application publishes the contents of a Google Docs document to a Blogger blog. It authenticates to Blogger with OAuth 2.0, reads the selected document, converts its paragraphs to simple HTML, and creates a Blogger post using the Blogger API.

## Features

- Lists Blogger blogs available to the authenticated user.
- Accepts either a Google Docs URL or document ID.
- Uses the document name as the Blogger post title.
- Converts Google Docs headings and paragraphs to HTML.
- Supports documents using the newer Docs tabs API by concatenating all tabs with separators.
- Adds a link back to the original Google Docs document.
- Creates the post through Blogger API v3 and labels it `GAS自動投稿`.
- Remembers the last selected blog in User Properties.

## Authentication and setup

The project uses the Apps Script OAuth2 library declared in `gas/appsscript.json`. Before use, set these Script Properties:

- `CLIENT_ID`
- `CLIENT_SECRET`

The OAuth service requests Blogger access and read access to Google Docs. If authentication is required, the web UI receives an authorization URL and the `authCallback` function handles the OAuth callback.

## Limitations

The document-to-HTML conversion is intentionally simple. It preserves heading levels and paragraph text, but does not attempt a full fidelity conversion of rich text, tables, embedded images, or other complex Docs structures.

## Main files

- `gas/Code.js` — OAuth, document conversion, and Blogger API logic.
- `gas/index.html` — Web App UI.
- `gas/appsscript.json` — scopes, Web App configuration, and OAuth2 library dependency.
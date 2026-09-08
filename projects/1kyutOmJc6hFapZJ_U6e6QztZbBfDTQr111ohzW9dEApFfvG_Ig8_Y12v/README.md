# Docs to Blogger Publisher

## Overview

This Google Apps Script web application publishes the contents of a Google Docs document to a Blogger blog. It authenticates to Blogger with OAuth 2.0, reads the selected document, converts its paragraphs to simple HTML, and creates a Blogger post using the Blogger API.

## Features

- Lists Blogger blogs available to the authenticated user.
- Accepts either a Google Docs URL or document ID.
- Uses the document name as the Blogger post title.
- Converts Google Docs headings and paragraphs to HTML.
- Supports documents using the newer Docs tabs API by concatenating top-level tabs with separators; nested child tabs are not traversed and their content is omitted.
- Adds a link back to the original Google Docs document.
- Creates the post through Blogger API v3 and labels it `GAS自動投稿`.
- Remembers the last selected blog in User Properties.

## Authentication and setup

The project uses the Apps Script OAuth2 library declared in `gas/appsscript.json`. Before use, set these Script Properties:

- `CLIENT_ID`
- `CLIENT_SECRET`

The separate OAuth2 service requests Blogger access and the `documents.readonly` scope. Independently, the Apps Script manifest requests the full `https://www.googleapis.com/auth/documents` scope for `DocumentApp` access, plus `script.external_request`. The Web App executes as the accessing user, so its effective Docs authorization is not read-only. If authentication is required, the web UI receives an authorization URL and the `authCallback` function handles the OAuth callback.

## Limitations

The document-to-HTML conversion is intentionally simple. It maps Docs H1-H4 to HTML h2-h5 and renders other headings, including H5/H6, as paragraphs. Empty paragraphs are skipped and paragraph newlines become `<br>`. Text is interpolated without HTML escaping, so literal HTML metacharacters can be interpreted as markup and are not reliably preserved. It does not attempt a full fidelity conversion of rich text, tables, embedded images, or other complex Docs structures. Review the generated post carefully before relying on its content.

## Main files

- `gas/Code.js` — OAuth, document conversion, and Blogger API logic.
- `gas/index.html` — Web App UI.
- `gas/appsscript.json` — scopes, Web App configuration, and OAuth2 library dependency.
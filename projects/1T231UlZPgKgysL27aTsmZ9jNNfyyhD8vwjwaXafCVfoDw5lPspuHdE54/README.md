# Apps Script Deployment Manager

## Overview

This Google Apps Script web application inventories Apps Script projects in the user's Google Drive and inspects their deployment metadata through the Apps Script API. It is intended as a management/diagnostic view for finding projects, versions, deployments, and Web App URLs without opening every Apps Script project individually.

## What it does

- Lists Apps Script files from Drive with `Drive.Files.list`.
- Queries Apps Script deployment endpoints in batches using the current Apps Script OAuth token.
- Collects deployment/version information and derives Web App URLs and project status where possible.
- Presents the collected information through the HTML web UI.
- Uses both Script Cache and User Cache to avoid repeatedly fetching the same inventory.
- Retries transient API failures with backoff and limits concurrent/batched requests.

## Web endpoints

`doGet(e)` supports the normal HTML UI and two JSON-oriented actions:

- `?action=get-data` — return cached data when available, otherwise fetch fresh data.
- `?action=clear-cache` — clear the application caches.

The cache lifetime used by the current implementation is 600 seconds.

## Implementation notes

The main server-side logic is in `gas/Code.js`. `gas/WebUI.html` and `gas/index.html` contain the browser-facing UI. The implementation depends on Google Drive access, external HTTP requests, and the Apps Script API.

Because this application can expose project IDs and deployment metadata, its Web App access settings should be chosen with the same care as any administrative tool.
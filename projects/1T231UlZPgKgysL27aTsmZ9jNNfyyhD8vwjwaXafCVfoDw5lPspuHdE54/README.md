# Apps Script Deployment Manager

## Overview

This Google Apps Script project inventories standalone Apps Script files in Google Drive and inspects their Web App deployment metadata through the Apps Script API. It includes a browser UI for displaying project names, deployment versions, status, and Web App URLs.

## What it does

- Lists non-trashed Apps Script files with paginated Advanced Drive service calls (`Drive.Files.list`).
- Queries each project's deployments sequentially using the current Apps Script OAuth token.
- Extracts Web App entry points and version numbers from deployment metadata.
- Uses User Cache for the Drive inventory (3,600 seconds) and successful deployment results (3,000 seconds).
- Waits 50 milliseconds before deployment requests and retries HTTP 429 or quota-related HTTP 403 responses with exponential backoff, for up to three attempts.

## Web UI and current limitations

`gas/WebUI.js` defines a `doGet()` that renders `gas/index.html`. The UI calls `loadDeploymentData()` through `google.script.run`; `clearCacheAndReload()` clears only the Drive inventory cache before reloading, so cached deployment results may remain.

The checked-in source also defines another `doGet()` in `gas/doGet.js` that returns `Hello, Web App!`. These duplicate entry points mean the intended UI routing is not unambiguous in the current source. No `?action=get-data` or `?action=clear-cache` routes are implemented.

## Requirements

`gas/Code.js` depends on the Advanced Drive service (`Drive.Files.list` with Drive API v3 fields), Apps Script API access, and external HTTP requests authorized by `ScriptApp.getOAuthToken()`.

This is an inspection tool; it does not create, update, or delete deployments. Because its UI can expose project IDs and deployment metadata, choose appropriate Web App access settings.

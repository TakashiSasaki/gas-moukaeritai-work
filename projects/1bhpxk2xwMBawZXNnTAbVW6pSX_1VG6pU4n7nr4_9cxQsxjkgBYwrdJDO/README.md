# Drive Shallow Mover

## Overview

Drive Shallow Mover is a Google Apps Script Web App for searching, browsing, and reorganizing files in Google Drive. Its server-side code uses the Advanced Drive service to list folders/files, inspect folder contents, create folders, and move selected files.

## Features

- Browse child folders starting from My Drive or another folder ID.
- Build breadcrumb-style folder paths by walking parent IDs.
- Search Drive files with arbitrary Drive API query strings.
- Fetch paginated result sets and display file metadata and formatted sizes.
- Count a folder's immediate children by MIME type.
- Create destination folders.
- Move multiple selected files by updating their Drive parents.
- Cache folder listings and statistics for 600 seconds in User Cache.
- Save per-user search settings in User Properties.
- Use user-level locks around mutating/settings operations to reduce concurrent-update conflicts.

## Implementation notes

The tool is intentionally "shallow": folder statistics count the direct children of the selected folder rather than recursively traversing the entire subtree.

The primary server logic is in `gas/Code.js`. The Web App UI is split across `Index.html`, `JavaScript.html`, routing code, and additional HTML assets. A `README.html` also exists inside `gas/` as Apps Script source; this repository-level `README.md` documents the project itself.

The implementation depends on the Advanced Drive service (`Drive.Files.*`). Moving files is a real Drive mutation, so the Web App should be deployed only for users who are expected to have that capability.
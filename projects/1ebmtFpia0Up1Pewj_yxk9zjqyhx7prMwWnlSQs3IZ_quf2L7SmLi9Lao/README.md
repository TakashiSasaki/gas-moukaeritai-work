# Google Tasks Viewer

## Overview

Google Tasks Viewer is a Google Apps Script Web App for inspecting Google Tasks lists, viewing per-list statistics and task details, and performing selected maintenance operations such as moving or deleting tasks.

## Features

- Lists the first page of task lists returned by the Advanced Google Tasks service.
- Detects the user's default task list.
- Computes per-list counts for active, completed, and deleted tasks.
- Shows oldest/newest update times and a preview of recent active task titles.
- Retrieves task details including title, status, due date, notes, and update time.
- Moves selected tasks between lists.
- Deletes selected tasks.
- Deletes non-default task lists while explicitly protecting the default list.
- Caches per-list statistics and the resolved default-list ID for 600 seconds.

## Pagination limitation

The current code does not follow next-page tokens. Statistics and task details use only the first page of up to 100 tasks per list, so counts, date ranges, and previews may be incomplete for larger lists.

## Move semantics

The current implementation does not use an atomic server-side "move" operation. For each selected task it:

1. Reads the original task.
2. Inserts a copy in the destination list.
3. Deletes the original task after the insertion succeeds.

If deletion fails after insertion, the result reports the partial failure so the user can detect the duplicate/copy state.

## Web App

`gas/Code.js` defines a `doGet(e)` handler that serves the main application or built-in help for `?page=readme`. A second handler in `gas/doGet.js` always serves the main application. Because both definitions are present, the materialized source does not establish a single unambiguous routing implementation.

## Requirements

The project relies on the Advanced Google Tasks service (`Tasks.Tasklists.*` and `Tasks.Tasks.*`). Operations that modify or delete tasks are real Google Tasks mutations and should be used with appropriate account/access controls.
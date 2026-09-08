# Google Tasks Viewer

## Overview

Google Tasks Viewer is a Google Apps Script Web App for inspecting Google Tasks lists, viewing per-list statistics and task details, and performing selected maintenance operations such as moving or deleting tasks.

## Features

- Lists all task lists available through the Advanced Google Tasks service.
- Detects the user's default task list.
- Computes per-list counts for active, completed, and deleted tasks.
- Shows oldest/newest update times and a preview of recent active task titles.
- Retrieves task details including title, status, due date, notes, and update time.
- Moves selected tasks between lists.
- Deletes selected tasks.
- Deletes non-default task lists while explicitly protecting the default list.
- Caches per-list statistics and the resolved default-list ID for 600 seconds.

## Move semantics

The current implementation does not use an atomic server-side "move" operation. For each selected task it:

1. Reads the original task.
2. Inserts a copy in the destination list.
3. Deletes the original task after the insertion succeeds.

If deletion fails after insertion, the result reports the partial failure so the user can detect the duplicate/copy state.

## Web App

`doGet(e)` normally serves the main application. `?page=readme` serves the built-in help page from the Apps Script project.

## Requirements

The project relies on the Advanced Google Tasks service (`Tasks.Tasklists.*` and `Tasks.Tasks.*`). Operations that modify or delete tasks are real Google Tasks mutations and should be used with appropriate account/access controls.
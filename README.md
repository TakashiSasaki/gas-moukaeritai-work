# Google Apps Script Project Management

This repository is used to download all projects from Google Apps Script and manage them using Git.

このリポジトリは複数のGoogle Apps Scriptプロジェクトを集めてコードを一元管理するためのものです。サブディレクトリごとに異なるGASプロジェクトが含まれています。
サブディレクトリ名はある程度Google Apps Scriptプロジェクトのプロジェクト名を反映していますが英数字と記号に限定したディレクトリ名とするためにこのリポジトリの中で付けなおしています。

## Purpose

The primary purpose of this repository is to provide a centralized location for:

*   **Backing up** your Google Apps Script projects.
*   **Version controlling** your scripts, allowing you to track changes, revert to previous versions, and collaborate more effectively.
*   **Managing** multiple Google Apps Script projects within a single Git repository structure.

## How it Works (General Idea)

Typically, this setup involves using a tool like `clasp` (the command-line tool for Google Apps Script) or custom scripts to:

1.  **List** all your Google Apps Script projects.
2.  **Clone** or **pull** each project into a local directory structure within this repository.
3.  **Commit** changes to Git to keep a history of your script development.

This allows you to leverage the power of Git for your Google Apps Script development workflow.

## Scheduled Workflows

This repository utilizes GitHub Actions workflows to automate certain tasks. These workflows operate on the `gas-pull` branch.

### Sync from GAS

*   **Schedule:** Runs daily (at 20 minutes past every hour).
*   **Purpose:** Automatically pulls the latest code from all registered Google Apps Script projects.
*   **Process:**
    1.  Checks out the `gas-pull` branch.
    2.  Uses `clasp` to pull updates for each linked Google Apps Script project into its corresponding directory.
    3.  If any changes are detected, commits them to the `gas-pull` branch with the message "chore: daily sync GAS → gas-pull".

### Update Apps Script Projects List

*   **Schedule:** Runs hourly (at the start of every hour).
*   **Purpose:** Keeps an updated list of all Google Apps Script projects associated with the account.
*   **Process:**
    1.  Checks out the `gas-pull` branch.
    2.  Uses `clasp list` to fetch the current list of projects.
    3.  Saves this list to the `clasp-list.txt` file.
    4.  If the `clasp-list.txt` file has changed since the last run, commits the updated file to the `gas-pull` branch with the message "Update Apps Script projects list". This workflow uses a force push.

These workflows help ensure that the repository remains a current backup and version-controlled representation of your Google Apps Script projects.

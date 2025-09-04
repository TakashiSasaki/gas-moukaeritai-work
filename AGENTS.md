# Agents Guide

This repository mirrors many Google Apps Script (GAS) projects and keeps them version‑controlled. It is also updated automatically by GitHub Actions. This guide explains how coding agents and contributors should work in this repo safely and consistently.

## Scope & Expectations

- Make focused, minimal changes related to the task at hand.
- Prefer surgical edits over broad refactors; avoid touching unrelated files or directories.
- Do not commit secrets or credentials. Assume the repo is public.

## Repository Layout

- Top‑level folders named like `1XXXXXXXX...` correspond to individual GAS projects (their scriptId). Treat each as an independent project mirror.
- Automation files live under `.github/workflows/` and keep the repo synchronized with GAS and metadata files.
- Helper scripts (e.g., `parse_clasp_list.py`, `create_missing_scriptid_dirs.py`, etc.) support synchronization and structure.
- README.md documents the overall purpose and scheduled workflows.

## Branching & Automation

- The `gas-pull` branch is managed by automation (GitHub Actions). Do not commit to it manually.
- For human/agent work, create a feature branch from the default branch, make changes, and open a PR. Keep PRs small and scoped.

## Editing Rules

- Keep directory names (scriptIds) intact. Do not rename or move these project folders.
- Within a project folder, you may add/update files as needed for the specific task, but avoid cross‑project changes unless explicitly requested.
- File extensions: prefer standard `.js` for JavaScript sources. Avoid hybrid suffixes like `.gs.js` for generated artifacts to ensure editor/tooling compatibility.
- When renaming files, ensure references/imports (if any) remain correct. Favor pure renames without content changes when only normalizing names.

## Commit Messages

Use Conventional Commits:

- `feat:` new functionality
- `fix:` bug fixes
- `refactor:` internal changes without behavior change
- `docs:` documentation only
- `chore:` routine maintenance, syncing, or tooling

Write clear subject lines and include a short body explaining the why/impact when helpful. Example:

```
refactor: rename spreadsheet.gs.js to spreadsheet.js for consistency

Normalize the filename to standard .js extension for better tooling and
to align with the rest of the codebase. Pure rename; no code changes.
```

## Validation Checklist

- Search for references to renamed/removed files and update as needed.
- Ensure formatting/line endings remain consistent and diffs are minimal.
- Do not break GitHub Actions workflows or modify their schedules without explicit instruction.

## Do / Don’t

- Do: keep changes tightly scoped, explain reasoning in commits, and respect automation branches.
- Do: use `rg` (ripgrep) for fast repository searches when available.
- Don’t: remove or rename scriptId directories, or commit directly to `gas-pull`.
- Don’t: add licenses or unrelated boilerplate without a request.

## Useful Tips

- Many tasks are per‑project; keep changes inside the relevant scriptId directory.
- If adding documentation, place general guidance at the repository root (like this file) and project‑specific notes inside the corresponding scriptId folder.


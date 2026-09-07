# Instructions for AI Agents

This repository stores and synchronizes many Google Apps Script projects in one Git repository.

## General Guidelines

1. Treat `projects/<SCRIPT_ID>/` as the only canonical location for materialized Apps Script project state.
2. Keep original Apps Script filenames whenever possible, including `Code.js`, `appsscript.json`, HTML files, and project-specific names.
3. Use the existing automation under `automation/` rather than inventing parallel synchronization scripts.
4. Do not manually edit generated inventory snapshots or `docs/projects.json` when the canonical automation can produce them.
5. Keep `README.md`, this file, and `docs/AGENTS.md` aligned with repository-level workflow changes.
6. Preserve actionable error output around clasp, Google APIs, authentication, JSON parsing, and filesystem operations.

## Repository Structure and Authority

- `automation/`: **how synchronization is performed**.
  - `stage-1-inventory/`: Drive inventory acquisition, canonical registry/lifecycle reconciliation, and public project-index generation.
  - `stage-2-inspection/`: read-only Apps Script API inspection and deterministic materialization planning; it must not invoke clasp or mutate project source/state. Manual read-only Apps Script change-signal diagnostics also live here so they reuse the same API semantics without becoming a separate authority.
  - `stage-3-materialization/`: transactional source materialization and observation finalization; it may use clasp only for `pull`.
  - `shared/`: repository, OAuth, and validation primitives shared by stages.
  - `maintenance/`: explicit historical migrations; these are not part of steady-state synchronization.
- `data/`: **what was externally observed**. Drive inventory snapshots live under `data/inventory/drive-api/snapshots/`.
- `projects/`: materialized Apps Script project state under `projects/<SCRIPT_ID>/`.
- `docs/`: GitHub Pages/public projection. Local rules live in `docs/AGENTS.md`.
- `.github/workflows/`: orchestration only; business logic belongs under `automation/`.

There is no supported repository-root project fallback. Do not recreate one.

The canonical state authorities are intentionally distinct:

- Stage 1 / Drive owns `driveApi` and `lifecycle.driveInventory`.
- Stage 2 owns read-only Apps Script remote observation and deterministic materialization planning.
- Stage 3 owns repository source materialization and finalization of Stage 2 observations.
- `syncState.lastMaterializedAppsScriptUpdateTime` records the Apps Script state that was **successfully materialized**, not merely observed.

Never infer successful synchronization solely from a freshly observed remote timestamp.

Direct Drive API and Apps Script API code must acquire bearer tokens through `automation/shared/google_oauth.py`. That provider may read clasp-compatible authorized-user credentials but must not use `clasp list` or mutate clasp's credential store to refresh direct-API access. clasp commands remain responsible for their own OAuth lifecycle.

## Synchronization Workflows

Stage 1 and Stage 2/3 use the same GitHub Actions concurrency group, `gas-project-state-writer`, with cancellation disabled. Keep canonical project-state writers serialized; do not introduce a parallel workflow that can mutate the default branch independently.

The manual `.github/workflows/diagnose-apps-script-change-signals.yml` workflow is deliberately outside that writer group because it is read-only. It may observe one Apps Script project and store run artifacts for before/after comparison, but it must not mutate Apps Script, invoke clasp, update `projects/`, write generated public state, commit, or push. Diagnostic observations and comparisons are evidence only; they do not become a canonical authority or silently change steady-state synchronization semantics.

### Stage 1 — inventory

`.github/workflows/stage-1-inventory.yml` runs every three hours and can also be dispatched manually. Its canonical sequence is:

1. `automation/stage-1-inventory/fetch-drive-inventory.py`
2. `automation/stage-1-inventory/reconcile-project-registry.py`
3. `automation/stage-1-inventory/generate-public-project-index.py`
4. repository validation

Stage 1 owns Drive observation, `driveApi` reconciliation, and Drive-derived lifecycle. It must not absorb Apps Script source pulling, deployment/version refresh, or historical migration.

`lifecycle.driveInventory` has two states:

- `present`: observed in the latest Drive inventory and eligible for normal publication/synchronization.
- `absent`: not observed in the latest Drive inventory. Preserve the entire `projects/<SCRIPT_ID>/` directory and source history, omit the project from the public index and normal downstream synchronization, and allow a later observation to return it to `present`.

Do not treat `absent` as authorization to delete source or the project directory.

### Stage 2 — inspection/planning

`.github/workflows/stage-2-3-sync.yml` is dispatched manually or after successful Stage 1 completion. Stage 2 runs `automation/stage-2-inspection/plan-materialization.py` and must:

1. use the Google Apps Script API directly for project metadata, file metadata, deployments, and versions;
2. skip projects whose Drive lifecycle is `absent`;
3. emit a deterministic JSON materialization plan;
4. remain read-only with respect to `projects/<SCRIPT_ID>/`;
5. fail closed when required Apps Script API observations cannot be obtained;
6. retry only transient Apps Script API HTTP `429`, `500`, `502`, `503`, and `504` responses through the shared request layer with a finite attempt budget and bounded delay; retry exhaustion remains a Stage 2 failure;
7. never invoke clasp or parse human-readable clasp output.

A valid HTTP `Retry-After` value may select the retry delay, but it must remain bounded. Without a usable `Retry-After`, use bounded exponential backoff with jitter. Ordinary client/auth/permission/not-found failures remain prompt failures rather than being hidden behind retries.

The Stage 2 plan is an ephemeral run artifact in `$RUNNER_TEMP`; it is not canonical repository state and must not be committed.

`automation/stage-2-inspection/diagnose-change-signals.py` is an experimental observer, not part of the recurring Stage 2 plan. It may capture project/file/deployment/version snapshots and compare them across manual runs to test whether `Project.updateTime` predicts downstream changes. A downstream change observed with an unchanged `Project.updateTime` is a counterexample to using that timestamp alone as an invalidation signal. The absence of such a counterexample in a finite experiment must not be promoted to an undocumented Google API guarantee.

### Stage 3 — materialization/finalization

The same workflow passes the Stage 2 plan directly to `automation/stage-3-materialization/materialize.py`. Stage 3 must:

1. reject malformed or stale plans before any source mutation;
2. use `clasp pull` as the only steady-state clasp command;
3. treat pull, stale tracked-source cleanup, post-pull validation, structured metadata persistence, and checkpoint advancement as one per-project transaction when a pull is required;
4. restore the complete pre-transaction project directory if any part of a required transaction fails;
5. preserve unrelated metadata namespaces, especially Stage 1-owned `driveApi` and `lifecycle`;
6. advance `syncState.lastMaterializedAppsScriptUpdateTime` only to the pre-pull Apps Script `updateTime` carried by the Stage 2 plan and only after successful source materialization;
7. leave the checkpoint unchanged when no correlated pre-pull `updateTime` exists, so the next inspection remains fail-safe;
8. refresh structured Apps Script/file/deployment/version observations for unchanged active projects without invoking clasp;
9. leave Drive-absent projects untouched;
10. honor a safe project-local `.clasp.json.rootDir` and reject source/root paths that can escape the canonical project directory;
11. reject a plan when a concrete current Drive lifecycle or successful-materialization checkpoint no longer matches the Stage 2 plan.

Node.js and clasp installation are conditional on `materializationRequired=true`. Do **not** skip Stage 3 when no pull is required: it may still need to finalize structured observations for unchanged active projects.

If Stage 3 fails, the workflow must not commit partial project state. A retry must start again from Stage 2 and build a new plan; do not reuse a plan from a failed or partially applied run.

After Stage 3 succeeds, run repository validation before committing. The synchronization workflow stages only `projects/` for its commit; Stage 1 remains responsible for Drive snapshots and public projections.

## Project Directory Rules

1. Do not rename or flatten `projects/<SCRIPT_ID>/`.
2. Keep `.clasp.json` in each tracked project directory with the correct non-empty `scriptId`.
3. Preserve unrelated namespaces in `metadata.json`. In particular, Stage 1 and downstream stages must not overwrite each other's authoritative metadata blocks.
4. Treat standalone `deployments.json`, `versions.json`, and their old text variants as legacy state, not as canonical outputs.
5. Be careful with case-insensitive filename collisions because this repository is actively used on Windows.
6. Never advance `syncState.lastMaterializedAppsScriptUpdateTime` for a failed or unattempted source synchronization.
7. Treat canonical project-directory symlinks and source/root paths that escape the canonical project directory as invalid synchronization targets.

## Project Creation and Deletion

- Creation: create only under `projects/<SCRIPT_ID>/` and initialize `.clasp.json` consistently with that Script ID.
- Lifecycle absence: a project missing from Drive is marked `lifecycle.driveInventory = "absent"`; retain its canonical directory and source history.
- Deletion: deleting a project directory is a separate destructive operation. Confirm the intended project before removing `projects/<SCRIPT_ID>/` and related generated references.
- Historical schema/file migration belongs in explicit maintenance tooling, not in recurring Stage 1 logic.

## Docs and Web UI

1. `docs/` is production public content for `https://gas.moukaeritai.work/`.
2. `docs/projects.json` is generated by `automation/stage-1-inventory/generate-public-project-index.py`; it contains only projects eligible under the current Drive lifecycle and must not be hand-maintained during normal synchronization.
3. Read `docs/AGENTS.md` before changing public site behavior or assets.

## Validation

Run `.github/scripts/validate-automation.py` and the unit tests under `automation/tests/` for repository automation changes. The validation workflow is `.github/workflows/validate-automation.yml`.

When changing synchronization semantics, preserve the separation between external observation, materialized project state, successful-materialization checkpoints, and public projection unless the repository architecture is intentionally being redesigned.

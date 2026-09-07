# Instructions for AI Agents

This repository stores and synchronizes many Google Apps Script projects in one Git repository.

## General Guidelines

1. Treat `projects/<SCRIPT_ID>/` as the only canonical location for a materialized Apps Script project. Within it, keep Apps Script/clasp materialization under `gas/` and repository-owned state under `repository/`.
2. Keep original Apps Script filenames whenever possible, including `Code.js`, `appsscript.json`, HTML files, and project-specific names. Their canonical materialized location is `projects/<SCRIPT_ID>/gas/`.
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
- `projects/`: materialized project directories under `projects/<SCRIPT_ID>/`.
  - `.clasp.json`: project binding; after split-layout cutover `rootDir` must be `gas`.
  - `gas/`: GAS/clasp materialized source only.
  - `repository/`: repository-owned structured state and supplemental assets; canonical metadata is `repository/metadata.json`.
  - `README.md`: optional project-root human-facing landing page.
- `docs/`: GitHub Pages/public projection. Local rules live in `docs/AGENTS.md`.
- `.github/workflows/`: orchestration only; business logic belongs under `automation/`.

There is no supported repository-root project fallback. Do not recreate one. The former flat per-project layout is historical state only; steady-state code and validation must use the split layout.

The canonical state authorities are intentionally distinct:

- Stage 1 / Drive owns `driveApi` and `lifecycle.driveInventory` in `repository/metadata.json`.
- Stage 2 owns read-only Apps Script remote observation and deterministic materialization planning.
- Stage 3 owns repository source materialization under `gas/` and finalization of Stage 2 observations in `repository/metadata.json`.
- `syncState.lastMaterializedAppsScriptUpdateTime` records the Apps Script source state that was **successfully materialized**, not merely observed.
- `reconciliationState.lastDeploymentVersionReconciliationAt` records the last successfully finalized paired deployment/version observation and is independent of the source-materialization checkpoint.

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

New Stage 1 projects must be created directly in the split layout: initialize `.clasp.json` with the project `scriptId` and `rootDir: "gas"`, and write canonical metadata to `repository/metadata.json`. Stage 1 must not create a new root-level `metadata.json`.

### Stage 2 — inspection/planning

`.github/workflows/stage-2-3-sync.yml` is dispatched manually or after successful Stage 1 completion. Stage 2 runs `automation/stage-2-inspection/plan-materialization.py` and must:

1. use the Google Apps Script API directly; observe project metadata for every active project, observe file metadata whenever source materialization is required or canonical file metadata is not safely reusable, and reconcile deployments plus versions as one paired observation unit only when the dedicated reconciliation checkpoint is due;
2. skip projects whose Drive lifecycle is `absent`;
3. emit a deterministic JSON materialization plan;
4. distinguish each `files`, `deployments`, and `versions` family as `observed` or `not-observed` in the plan; a `not-observed` family must not carry a stale payload that could be mistaken for a fresh observation;
5. use the source fast path only when `Project.updateTime` exactly matches the successful-materialization checkpoint **and** current canonical `files` metadata is structurally reusable; otherwise refresh file metadata fail-safe;
6. keep deployment/version reconciliation completely independent from `Project.updateTime`; the diagnostic evidence contains a real counterexample where those families changed while the project timestamp did not;
7. treat missing deployment/version checkpoint state as due, age below 24 hours as not due, and age at or above 24 hours as due; invalid or future-dated checkpoint timestamps must fail safe to due rather than suppress observation;
8. when deployment/version reconciliation is due, obtain both `deployments.list` and `versions.list` successfully before emitting either family as a completed reconciliation; a failure in either request aborts Stage 2 and cannot advance the checkpoint;
9. inject or otherwise centralize the Stage 2 current time so reconciliation-boundary tests remain deterministic; carry the correlated successful observation time in the ephemeral plan rather than recomputing it later in Stage 3;
10. keep request-reduction decisions observable through deterministic plan statistics/logging, including observed/not-observed counts and reconciliation-due counts, rather than making silent skips;
11. remain read-only with respect to `projects/<SCRIPT_ID>/`;
12. fail closed when required Apps Script API observations cannot be obtained;
13. retry only transient Apps Script API HTTP `429`, `500`, `502`, `503`, and `504` responses through the shared request layer with a finite attempt budget and bounded delay; retry exhaustion remains a Stage 2 failure;
14. never invoke clasp or parse human-readable clasp output.

Source freshness remains three-hourly through the Stage 1 → Stage 2/3 cadence. Deployment/version metadata uses bounded staleness: under healthy scheduled operation it is reconciled when the successful reconciliation checkpoint reaches 24 hours, and it may intentionally remain stale inside that window. A healthy unchanged, non-due project should normally require only `projects.get` from the Apps Script API.

A valid HTTP `Retry-After` value may select the retry delay, but it must remain bounded. Without a usable `Retry-After`, use bounded exponential backoff with jitter. Ordinary client/auth/permission/not-found failures remain prompt failures rather than being hidden behind retries.

The Stage 2 plan is an ephemeral run artifact in `$RUNNER_TEMP`; it is not canonical repository state and must not be committed. Its `metadataReconciliation` data is correlated run state for Stage 3 finalization, not a second canonical authority.

`automation/stage-2-inspection/diagnose-change-signals.py` is an experimental observer, not part of the recurring Stage 2 plan. It may capture project/file/deployment/version snapshots and compare them across manual runs to test whether `Project.updateTime` predicts downstream changes. A downstream change observed with an unchanged `Project.updateTime` is a counterexample to using that timestamp alone as an invalidation signal. The absence of such a counterexample in a finite experiment must not be promoted to an undocumented Google API guarantee.

### Stage 3 — materialization/finalization

The same workflow passes the Stage 2 plan to `automation/stage-3-materialization/run-materialization.py`. That entrypoint validates and finalizes deployment/version reconciliation state while delegating the established source transaction and partial-observation semantics to `materialize.py`. Stage 3 must:

1. reject malformed or stale plans before any source mutation when possible, and roll back a required source transaction if a reconciliation-finalization check fails after the pull has begun;
2. use `clasp pull` as the only steady-state clasp command;
3. materialize Apps Script source only under the safe project-local `gas/` root selected by `.clasp.json.rootDir`;
4. treat pull, stale tracked-source cleanup, post-pull validation, structured metadata persistence, and checkpoint advancement as one per-project transaction when a pull is required;
5. restore the complete pre-transaction project directory if any part of a required transaction fails;
6. preserve unrelated metadata namespaces, especially Stage 1-owned `driveApi` and `lifecycle`;
7. advance `syncState.lastMaterializedAppsScriptUpdateTime` only to the pre-pull Apps Script `updateTime` carried by the Stage 2 plan and only after successful source materialization;
8. leave the source checkpoint unchanged when no correlated pre-pull `updateTime` exists, so the next inspection remains fail-safe;
9. replace canonical `files`, `deployments`, and `versions` metadata only when the corresponding Stage 2 family is `observed`; preserve the current canonical family unchanged when it is `not-observed`;
10. require an observed `files` family before any source materialization so pull validation and stale-source cleanup never operate from stale metadata;
11. advance `reconciliationState.lastDeploymentVersionReconciliationAt` only when the Stage 2 plan records a due reconciliation with both deployments and versions observed and the Stage 3 metadata finalization succeeds;
12. never advance the deployment/version reconciliation checkpoint on a `not-observed` run, on a partial/invalid pair, on an Apps Script API failure, or on a Stage 3 failure;
13. verify that the current canonical deployment/version reconciliation checkpoint still equals the exact value against which Stage 2 planned a due reconciliation before replacing it;
14. refresh structured Apps Script/file/deployment/version observations for unchanged active projects without invoking clasp when those families were observed;
15. leave Drive-absent projects untouched;
16. honor a safe project-local `.clasp.json.rootDir` and reject source/root paths that can escape the canonical project directory;
17. reject a plan when a concrete current Drive lifecycle or successful-materialization checkpoint no longer matches the Stage 2 plan.

Node.js and clasp installation are conditional on `materializationRequired=true`. Do **not** skip Stage 3 when no pull is required: it may still need to finalize structured observations or a due deployment/version reconciliation for unchanged active projects.

If Stage 3 fails, the workflow must not commit partial project state. A retry must start again from Stage 2 and build a new plan; do not reuse a plan from a failed or partially applied run.

After Stage 3 succeeds, run repository validation before committing. The synchronization workflow stages only `projects/` for its commit; Stage 1 remains responsible for Drive snapshots and public projections.

## Project Directory Rules

1. Do not rename or flatten `projects/<SCRIPT_ID>/`.
2. Keep `.clasp.json` at the project root with the correct non-empty `scriptId` and `rootDir: "gas"`.
3. Keep Apps Script/clasp materialized source under `gas/`. Do not place `.js`, `.html`, or `appsscript.json` back at the project root.
4. Keep canonical structured repository state in `repository/metadata.json`. Root-level `metadata.json` is legacy and is rejected after the split-layout cutover.
5. Preserve unrelated namespaces in `repository/metadata.json`. In particular, Stage 1 and downstream stages must not overwrite each other's authoritative metadata blocks.
6. Repository-owned supplemental files and directories belong under `repository/`, except for the optional project-root `README.md`.
7. Treat standalone `deployments.json`, `versions.json`, and their old text variants as legacy state, not as canonical outputs.
8. Keep project-root entries limited to `.clasp.json`, optional `README.md`, `gas/`, and `repository/`; use the explicit maintenance migration rather than manually mixing flat and split layouts.
9. Be careful with case-insensitive filename collisions because this repository is actively used on Windows.
10. Never advance `syncState.lastMaterializedAppsScriptUpdateTime` for a failed or unattempted source synchronization.
11. Never advance `reconciliationState.lastDeploymentVersionReconciliationAt` unless both deployment and version observations were freshly obtained in the same due Stage 2 reconciliation and successfully finalized by Stage 3.
12. Treat canonical project-directory symlinks and source/root paths that escape the canonical project directory as invalid synchronization targets.

## Project Creation and Deletion

- Creation: create only under `projects/<SCRIPT_ID>/`, initialize `.clasp.json` with that Script ID and `rootDir: "gas"`, and create canonical repository metadata under `repository/metadata.json`.
- Lifecycle absence: a project missing from Drive is marked `lifecycle.driveInventory = "absent"`; retain its canonical directory and source history.
- Deletion: deleting a project directory is a separate destructive operation. Confirm the intended project before removing `projects/<SCRIPT_ID>/` and related generated references.
- Historical schema/file migration belongs in explicit maintenance tooling, not in recurring Stage 1 logic. The flat-to-split project migration is implemented by `automation/maintenance/migrate-project-layout.py`; steady-state code must not recreate the legacy layout. The deployment/version reconciliation checkpoint does not need a historical migration: missing checkpoint state intentionally makes the first active-project reconciliation due.

## Docs and Web UI

1. `docs/` is production public content for `https://gas.moukaeritai.work/`.
2. `docs/projects.json` is generated by `automation/stage-1-inventory/generate-public-project-index.py`; it contains only projects eligible under the current Drive lifecycle and must not be hand-maintained during normal synchronization.
3. Read `docs/AGENTS.md` before changing public site behavior or assets.
4. Project-root `README.md` remains outside `gas/` and `repository/` because the public site may fetch it directly as a human-facing summary.

## Validation

Run `.github/scripts/validate-automation.py` and the unit tests under `automation/tests/` for repository automation changes. The validation workflow is `.github/workflows/validate-automation.yml`.

Repository validation is strict about the post-cutover project layout: each project must have `repository/metadata.json`, `.clasp.json.rootDir == "gas"`, no legacy root `metadata.json`, and no unexpected project-root entries outside the split-layout allowlist.

When changing synchronization semantics, preserve the separation between external observation, materialized project state, successful source-materialization checkpoints, deployment/version reconciliation checkpoints, and public projection unless the repository architecture is intentionally being redesigned.

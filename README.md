# Google Apps Script Project Management

This repository backs up and version-controls multiple Google Apps Script projects in one Git repository.

各 Google Apps Script project は `projects/<SCRIPT_ID>/` に配置され、Script ID を directory name として使用します。

## Repository Model

The repository separates synchronization responsibilities explicitly:

- `automation/`: synchronization implementation — **how** state is observed and synchronized.
- `data/`: external observations — **what** was observed, including Drive inventory snapshots.
- `projects/`: materialized Apps Script project source and metadata.
- `docs/`: the public GitHub Pages projection, including generated `projects.json`.

## GitHub Actions Workflows

The default branch is `gas.moukaeritai.work`.

### Stage 1: Drive inventory

Workflow: `.github/workflows/stage-1-inventory.yml`

- **Trigger:** every three hours or manual dispatch.
- **Purpose:** observe Apps Script projects through Drive API, reconcile canonical project registry metadata and lifecycle, and regenerate the public project index.
- **Pipeline:**
  1. `automation/stage-1-inventory/fetch-drive-inventory.py`
  2. `automation/stage-1-inventory/reconcile-project-registry.py`
  3. `automation/stage-1-inventory/generate-public-project-index.py`
  4. repository validation
- **Outputs:** Drive snapshots under `data/inventory/drive-api/snapshots/`, `projects/<SCRIPT_ID>/` registry state, and `docs/projects.json`.

Stage 1 is the authority for Drive-derived project presence. `metadata.json` records this as `lifecycle.driveInventory`:

- `present`: the project exists in the latest Drive inventory and participates in normal publication/synchronization.
- `absent`: the project is missing from the latest Drive inventory. The canonical project directory and source history are retained, but the project is excluded from `docs/projects.json` and normal downstream synchronization. A later Drive observation can return it to `present`.

An `absent` transition is therefore **not** a project deletion.

### Stage 2 + Stage 3: Apps Script synchronization

Workflow: `.github/workflows/stage-2-3-sync.yml`

- **Trigger:** manual dispatch or successful completion of the Stage 1 workflow.
- **Stage 2 — inspection/planning:** `automation/stage-2-inspection/plan-materialization.py` observes Apps Script project state on every active-project run, observes file metadata when source freshness requires it, and reconciles deployment/version metadata on a separate bounded-staleness clock. It emits a deterministic plan without mutating canonical project state or invoking clasp.
- **Stage 3 — materialization/finalization:** `automation/stage-3-materialization/run-materialization.py` validates reconciliation metadata, delegates source transactions to `materialize.py`, finalizes structured observations, and advances the appropriate successful checkpoints inside the existing per-project transaction boundary.
- **Validation:** repository structural validation runs after Stage 3 and before any commit.
- **Publication:** only `projects/` changes produced by a successful Stage 3 run are committed by this workflow.

Stage 2 plans distinguish an observation family that was refreshed from one that was deliberately not observed. For `files`, `deployments`, and `versions`, `observationState` records `observed` or `not-observed`. Stage 3 replaces canonical metadata only for `observed` families; a `not-observed` family is preserved exactly from current canonical metadata and must not carry a stale payload in the plan. Source materialization additionally requires an observed `files` family.

**Source freshness is checked every 3 hours. Deployment/version metadata is reconciled at least once every 24 hours under healthy scheduled operation.** Deployment/version metadata may therefore be intentionally stale within that bounded window. A missing reconciliation checkpoint is treated as due, so existing projects need no migration before their first reconciliation run.

Stage 2 uses `Project.updateTime` only for the source/file fast path. It compares that value with `syncState.lastMaterializedAppsScriptUpdateTime`; when the timestamps match and existing canonical `files` metadata is structurally reusable, Stage 2 emits `files: not-observed` and avoids the file-metadata request. Otherwise it refreshes file metadata fail-safe.

Deployments and versions are deliberately independent from that timestamp decision. The manual diagnostic workflow demonstrated a real counterexample in which deployment/version API representations changed while `Project.updateTime` and files remained unchanged. Stage 2 therefore uses `reconciliationState.lastDeploymentVersionReconciliationAt` and a 24-hour age test instead: age below 24 hours emits `deployments: not-observed` and `versions: not-observed` with no stale payload; age at or above 24 hours, a missing checkpoint, an invalid timestamp, or a future-dated checkpoint performs both API observations. The correlated Stage 2 observation time is carried in the ephemeral plan and is persisted only after successful Stage 3 finalization.

The plan records `observationStats` including active projects, observed/not-observed counts for all three families, and the number of deployment/version reconciliations due. This makes request reduction visible without turning run statistics into canonical authority. For a healthy unchanged project after a successful reconciliation, a normal non-due three-hour run performs only `projects.get`; over eight runs per day the intended logical observation pattern is approximately eight `projects.get` calls plus one deployments reconciliation and one versions reconciliation, or about 10 logical calls instead of the previous 24. This is a logical request-count estimate, not a wall-clock runtime guarantee.

The shared Stage 2 Apps Script API client retries transient HTTP `429`, `500`, `502`, `503`, and `504` responses with a finite attempt budget. A valid `Retry-After` header is honored within the configured delay bound; otherwise the client uses bounded exponential backoff with jitter. Retry exhaustion remains fatal, so Stage 2 still fails closed without producing a successful plan or allowing Stage 3/commit to proceed. A failure of either deployments or versions observation aborts the reconciliation unit and cannot advance its checkpoint.

`clasp pull` is the only steady-state clasp command. Node.js and clasp are installed only when the Stage 2 plan reports that source materialization is required. Stage 3 still runs when zero pulls are required because unchanged active projects may need structured Apps Script observations or a due deployment/version reconciliation finalized.

Stage 1 and the Stage 2/3 workflow share a repository-writer concurrency group. This serializes their default-branch mutations so a Stage 2 plan and its Stage 3 application are not raced by another canonical project-state writer.

Remote observation, successful source materialization, and deployment/version reconciliation are separate states. `appsScriptApi.updateTime` records observed Apps Script project state, `syncState.lastMaterializedAppsScriptUpdateTime` records the Apps Script source state successfully materialized, and `reconciliationState.lastDeploymentVersionReconciliationAt` records the last successfully finalized paired deployment/version observation. A failed Stage 2 inspection, failed source pull, or failed Stage 3 transaction must not advance the checkpoint it did not successfully complete. A `not-observed` deployment/version run never advances the reconciliation checkpoint.

Stage 3 also rejects a plan if a concrete current Drive lifecycle or successful-materialization checkpoint no longer matches the state observed when Stage 2 built the plan. The reconciliation-aware Stage 3 entrypoint additionally verifies that a due reconciliation was planned against the same canonical reconciliation checkpoint before persisting the new one.

### Change-signal diagnostics

Workflow: `.github/workflows/diagnose-apps-script-change-signals.yml`

This workflow is a manual, read-only experiment for evaluating whether `Project.updateTime` is a safe invalidation signal for the more specific Stage 2 observations.

- **Trigger:** `workflow_dispatch` only.
- **Input:** one Apps Script `script_id`, plus an optional previous diagnostic `baseline_run_id`.
- **Observation:** captures project metadata, metadata-only file observations, deployments, and versions through the same Apps Script API client used by Stage 2.
- **Output:** uploads the current snapshot as a GitHub Actions artifact. With `baseline_run_id`, it also downloads that prior snapshot and emits a comparison artifact.
- **Safety:** no Apps Script mutation, no clasp invocation, no repository write permission, and no canonical project-state update.

The comparison explicitly reports any file/deployment/version change observed while `Project.updateTime` remained unchanged. Such a transition is a counterexample to using `Project.updateTime` alone to skip that observation family. Absence of a counterexample in one experiment is evidence about that observed transition only; it is not treated as a new API contract.

### Validation

Workflow: `.github/workflows/validate-automation.yml`

Pull requests are checked with repository structural validation and unit tests under `automation/tests/` without requiring Google credentials.

## Project State

Each tracked project normally contains:

- `.clasp.json` with its Script ID;
- `metadata.json` with namespaced metadata such as `driveApi`, `appsScriptApi`, `lifecycle`, `syncState`, and `reconciliationState`;
- Apps Script source files materialized by the synchronization pipeline.

The repository intentionally distinguishes four concepts:

1. Drive observation (`driveApi` and `lifecycle.driveInventory`);
2. Apps Script remote observation (`appsScriptApi` and related remote metadata);
3. successful source materialization (`syncState.lastMaterializedAppsScriptUpdateTime`);
4. successful paired deployment/version reconciliation (`reconciliationState.lastDeploymentVersionReconciliationAt`).

Historical metadata/file migrations are explicit maintenance operations under `automation/maintenance/`; they are not part of recurring Stage 1 synchronization. The deployment/version reconciliation checkpoint does not require a historical migration: missing state simply makes the next active-project Stage 2 run reconciliation-due.

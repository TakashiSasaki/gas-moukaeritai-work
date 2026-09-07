# Automation

`automation/` contains **how synchronization is performed**.

The synchronization architecture separates implementation from observed data and materialized project state:

- `shared/` contains repository, OAuth, and validation primitives shared by stages.
- `stage-1-inventory/` owns Drive inventory acquisition, project registry reconciliation, and public index generation.
- `stage-2-inspection/` is the steady-state clasp-free Apps Script API inspection/planning implementation. It observes project state on every active-project run, uses the source update checkpoint to decide whether file metadata must be refreshed, and uses a separate 24-hour reconciliation checkpoint for deployments/versions. It also contains the manual read-only change-signal diagnostic used to demonstrate why deployment/version observation cannot be gated by `Project.updateTime`.
- `stage-3-materialization/` is the steady-state materialization/finalization implementation. `run-materialization.py` is the workflow entrypoint; it finalizes the deployment/version reconciliation checkpoint and delegates the established source transaction plus partial-observation semantics to `materialize.py`. Stage 3 uses only `clasp pull` for required source changes.
- `maintenance/` contains explicit historical migrations that do not run as part of steady-state synchronization.

Direct Drive and Apps Script API callers acquire bearer tokens through `shared/google_oauth.py`. This provider reads compatible clasp authorized-user credentials but does not invoke `clasp list` or mutate clasp's credential store; clasp commands remain responsible for their own OAuth refresh.

Stage 2 is read-only and owns remote Apps Script observation. Stage 3 owns source materialization and repository-side finalization of that observation. A required Stage 3 project transaction is successful only after `clasp pull`, post-pull validation, metadata persistence, and applicable checkpoint advancement all succeed. Otherwise the project directory is restored. Unchanged projects can persist structured observations without invoking clasp, while Drive-absent projects are left untouched.

Source freshness and deployment/version freshness are deliberately independent. Source freshness follows the three-hour workflow cadence and uses `syncState.lastMaterializedAppsScriptUpdateTime`. Deployments and versions are reconciled as a pair when `reconciliationState.lastDeploymentVersionReconciliationAt` is missing or at least 24 hours old. A non-due run marks both families `not-observed` and preserves their canonical metadata. A successful due reconciliation advances its checkpoint only inside Stage 3 finalization; API failures, Stage 3 failures, and not-observed runs do not advance it.

External inventory snapshots belong under `data/`; Apps Script project state belongs under `projects/`; GitHub Pages projections belong under `docs/`.

GitHub Actions orchestration lives under `.github/workflows/` and calls these modules rather than duplicating their business logic. The active downstream synchronization workflow is `.github/workflows/stage-2-3-sync.yml`; it runs Stage 2 then the reconciliation-aware Stage 3 entrypoint from one ephemeral plan, installs clasp only when a pull is required, validates repository state before commit, and shares a writer-concurrency group with Stage 1.

`.github/workflows/diagnose-apps-script-change-signals.yml` is a separate `workflow_dispatch`-only observer. It calls `stage-2-inspection/diagnose-change-signals.py` for one Script ID, uploads a read-only API snapshot artifact, and can compare that snapshot with a prior diagnostic run by `baseline_run_id`. It has no repository write permission, invokes no clasp command, and is not part of recurring synchronization or any canonical-state authority.

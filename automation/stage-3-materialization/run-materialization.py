#!/usr/bin/env python3
"""Run Stage 3 with transactional deployment/version checkpoint finalization."""

from __future__ import annotations

import argparse
import importlib.util
import sys
from pathlib import Path
from types import ModuleType
from typing import Any, Callable

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from automation.shared.project_registry import ProjectRegistryError, write_metadata

RECONCILIATION_CHECKPOINT_FIELD = "lastDeploymentVersionReconciliationAt"


def _load_sibling(name: str, filename: str) -> ModuleType:
    path = Path(__file__).resolve().with_name(filename)
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load Stage 3 module: {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


core = _load_sibling("stage3_materialization_core", "materialize.py")


def _optional_timestamp(value: Any, label: str, script_id: str) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str) or not value:
        raise core.MaterializationPlanError(
            f"{script_id}: {label} must be a non-empty string or null"
        )
    return value


def _current_reconciliation_checkpoint(metadata: dict[str, Any]) -> str | None:
    """Normalize canonical checkpoint state exactly as Stage 2 does.

    Invalid/missing namespaces and empty/non-string checkpoint values are
    intentionally equivalent to no checkpoint. Stage 2 treats those states as
    reconciliation-due, so Stage 3 must allow a successful fresh pair to heal
    them instead of making the repository permanently unreconcilable.
    """
    state = metadata.get("reconciliationState")
    if not isinstance(state, dict):
        return None
    checkpoint = state.get(RECONCILIATION_CHECKPOINT_FIELD)
    if isinstance(checkpoint, str) and checkpoint:
        return checkpoint
    return None


def _validate_reconciliation_item(item: dict[str, Any]) -> None:
    script_id = item.get("scriptId")
    if not isinstance(script_id, str) or not script_id:
        raise core.MaterializationPlanError(
            "Stage 2 plan project is missing scriptId"
        )
    reconciliation = item.get("metadataReconciliation")
    if reconciliation is None:
        # Legacy or hand-authored schema-v2 plans remain valid, but cannot
        # advance the new checkpoint because no correlated Stage 2 time exists.
        return
    if not isinstance(reconciliation, dict):
        raise core.MaterializationPlanError(
            f"{script_id}: metadataReconciliation must be an object"
        )
    due = reconciliation.get("due")
    if not isinstance(due, bool):
        raise core.MaterializationPlanError(
            f"{script_id}: metadataReconciliation.due must be a boolean"
        )
    checkpoint = _optional_timestamp(
        reconciliation.get("checkpointAt"),
        "metadataReconciliation.checkpointAt",
        script_id,
    )
    observed_at = _optional_timestamp(
        reconciliation.get("observedAt"),
        "metadataReconciliation.observedAt",
        script_id,
    )
    lifecycle = item.get("lifecycle")
    observation = item.get("observation")

    if lifecycle == "absent":
        if due or observed_at is not None:
            raise core.MaterializationPlanError(
                f"{script_id}: absent project cannot perform metadata reconciliation"
            )
        return

    if not isinstance(observation, dict):
        raise core.MaterializationPlanError(
            f"{script_id}: active metadata reconciliation needs an observation"
        )
    states = observation.get("observationState")
    if not isinstance(states, dict):
        raise core.MaterializationPlanError(
            f"{script_id}: metadata reconciliation requires observationState"
        )

    deployments_state = states.get("deployments")
    versions_state = states.get("versions")
    if due:
        if observed_at is None:
            raise core.MaterializationPlanError(
                f"{script_id}: due metadata reconciliation needs observedAt"
            )
        if deployments_state != "observed" or versions_state != "observed":
            raise core.MaterializationPlanError(
                f"{script_id}: due metadata reconciliation requires observed deployments and versions"
            )
    else:
        if observed_at is not None:
            raise core.MaterializationPlanError(
                f"{script_id}: skipped metadata reconciliation must not carry observedAt"
            )
        if deployments_state != "not-observed" or versions_state != "not-observed":
            raise core.MaterializationPlanError(
                f"{script_id}: skipped metadata reconciliation requires not-observed deployments and versions"
            )

    # Parsing checkpointAt is deliberately not required. Stage 2 treats an
    # invalid historical timestamp string as reconciliation-due and preserves
    # the exact non-empty string in checkpointAt for stale-plan correlation.
    _ = checkpoint


def _plan_index(plan: dict[str, Any]) -> dict[str, dict[str, Any]]:
    projects = plan.get("projects")
    if not isinstance(projects, list):
        raise core.MaterializationPlanError("Stage 2 plan projects must be a list")
    index: dict[str, dict[str, Any]] = {}
    for item in projects:
        if not isinstance(item, dict):
            raise core.MaterializationPlanError(
                "each Stage 2 plan project must be an object"
            )
        _validate_reconciliation_item(item)
        script_id = item["scriptId"]
        if script_id in index:
            raise core.MaterializationPlanError(
                f"duplicate Stage 2 plan project: {script_id}"
            )
        index[script_id] = item
    return index


def _metadata_with_reconciliation_checkpoint(
    metadata: dict[str, Any],
    item: dict[str, Any],
    script_id: str,
) -> dict[str, Any]:
    reconciliation = item.get("metadataReconciliation")
    if not isinstance(reconciliation, dict) or not reconciliation.get("due"):
        return metadata

    planned_checkpoint = _optional_timestamp(
        reconciliation.get("checkpointAt"),
        "metadataReconciliation.checkpointAt",
        script_id,
    )
    current_checkpoint = _current_reconciliation_checkpoint(metadata)
    if current_checkpoint != planned_checkpoint:
        raise core.MaterializationPlanError(
            f"{script_id}: stale metadata reconciliation checkpoint {planned_checkpoint!r}; "
            f"current repository checkpoint is {current_checkpoint!r}"
        )

    observed_at = _optional_timestamp(
        reconciliation.get("observedAt"),
        "metadataReconciliation.observedAt",
        script_id,
    )
    if observed_at is None:
        raise core.MaterializationPlanError(
            f"{script_id}: due metadata reconciliation needs observedAt"
        )

    result = dict(metadata)
    state = result.get("reconciliationState")
    # Keep valid namespace siblings, but deliberately replace malformed
    # namespace values because Stage 2 normalized them to a missing checkpoint
    # and this successful reconciliation is the self-healing path.
    state = dict(state) if isinstance(state, dict) else {}
    state[RECONCILIATION_CHECKPOINT_FIELD] = observed_at
    result["reconciliationState"] = state
    return result


def materialize_plan(
    plan: dict[str, Any],
    root: Path | str | None = None,
    *,
    clasp: Any = None,
    metadata_writer: Callable[[Path | str, dict[str, Any]], None] = write_metadata,
) -> dict[str, Any]:
    """Delegate to the Stage 3 core with reconciliation-aware metadata writes."""
    index = _plan_index(plan)

    def reconciliation_writer(
        project_dir: Path | str,
        metadata: dict[str, Any],
    ) -> None:
        script_id = Path(project_dir).name
        item = index.get(script_id)
        if item is None:
            raise core.MaterializationPlanError(
                f"{script_id}: Stage 3 metadata write has no matching plan item"
            )
        metadata_writer(
            project_dir,
            _metadata_with_reconciliation_checkpoint(metadata, item, script_id),
        )

    return core.materialize_plan(
        plan,
        root,
        clasp=clasp,
        metadata_writer=reconciliation_writer,
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Transactionally apply a Stage 2 plan and finalize reconciliation checkpoints."
    )
    parser.add_argument("--plan", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = materialize_plan(core.read_json(args.plan))
    except (core.MaterializationPlanError, ProjectRegistryError, RuntimeError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    core.write_json(result, args.output)
    attempted = sum(1 for item in result["projects"] if item["attempted"])
    failed = sum(1 for item in result["projects"] if not item["successful"])
    print(
        f"Stage 3 attempted {attempted} pull(s); {failed} project transaction(s) failed."
    )
    return 0 if result["allProjectsSuccessful"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

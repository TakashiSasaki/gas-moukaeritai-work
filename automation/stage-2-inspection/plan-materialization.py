#!/usr/bin/env python3
"""Inspect Apps Script remote state and build a deterministic materialization plan.

Stage 2 is read-only with respect to canonical project state. It uses the Apps
Script API only and never invokes clasp or writes source files.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path, PurePosixPath
from types import ModuleType
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from automation.shared.google_oauth import GoogleOAuthError, acquire_access_token
from automation.shared.project_registry import iter_project_directories, load_metadata
from automation.shared.project_validation import CaseInsensitiveNameConflict, validate_files

RECONCILIATION_INTERVAL = timedelta(hours=24)
RECONCILIATION_CHECKPOINT_FIELD = "lastDeploymentVersionReconciliationAt"


def _load_sibling(name: str, filename: str) -> ModuleType:
    path = Path(__file__).resolve().with_name(filename)
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load Stage 2 inspection module: {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


apps_script_api = _load_sibling("stage2_inspection_apps_script_api", "apps_script_api.py")


def materialized_update_time(metadata: dict[str, Any]) -> str | None:
    """Return the successful materialization checkpoint during schema migration."""
    sync_state = metadata.get("syncState")
    if isinstance(sync_state, dict):
        checkpoint = sync_state.get("lastMaterializedAppsScriptUpdateTime")
        return str(checkpoint) if checkpoint else None

    # Before syncState existed, appsScriptApi.updateTime was written only after
    # successful synchronization. It is therefore a migration fallback only
    # while the explicit syncState namespace is absent.
    apps_script = metadata.get("appsScriptApi")
    if isinstance(apps_script, dict) and apps_script.get("updateTime"):
        return str(apps_script["updateTime"])
    legacy = metadata.get("lastUpdated")
    return str(legacy) if legacy else None


def deployment_version_reconciliation_checkpoint(metadata: dict[str, Any]) -> str | None:
    """Return the canonical deployment/version reconciliation checkpoint, if usable."""
    state = metadata.get("reconciliationState")
    if not isinstance(state, dict):
        return None
    checkpoint = state.get(RECONCILIATION_CHECKPOINT_FIELD)
    if isinstance(checkpoint, str) and checkpoint:
        return checkpoint
    return None


def drive_lifecycle(metadata: dict[str, Any]) -> str:
    lifecycle = metadata.get("lifecycle")
    if isinstance(lifecycle, dict) and lifecycle.get("driveInventory") in {"present", "absent"}:
        return str(lifecycle["driveInventory"])
    return "unknown"


def _sort_files(files: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        files,
        key=lambda item: (
            str(item.get("name", "")),
            str(item.get("type", "")),
            json.dumps(item, ensure_ascii=False, sort_keys=True),
        ),
    )


def _sort_deployments(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        items,
        key=lambda item: (
            str(item.get("deploymentId", "")),
            json.dumps(item, ensure_ascii=False, sort_keys=True),
        ),
    )


def _sort_versions(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        items,
        key=lambda item: (
            str(item.get("versionNumber", "")),
            json.dumps(item, ensure_ascii=False, sort_keys=True),
        ),
    )


def _materialization_decision(
    checkpoint: str | None,
    remote_update_time: str | None,
) -> tuple[bool, str]:
    if not checkpoint:
        return True, "no-materialization-checkpoint"
    if not remote_update_time:
        return True, "remote-update-time-unavailable"
    if remote_update_time == checkpoint:
        return False, "checkpoint-matches-remote"
    return True, "remote-update-time-changed"


def _canonical_files_reusable(metadata: dict[str, Any], script_id: str) -> bool:
    """Return whether existing file metadata is safe to preserve on the fast path."""
    files = metadata.get("files")
    if (
        not isinstance(files, list)
        or not files
        or any(not isinstance(item, dict) for item in files)
    ):
        return False
    for item in files:
        name = item.get("name")
        if not isinstance(name, str) or not name or "\\" in name:
            return False
        relative = PurePosixPath(name)
        if relative.is_absolute() or not relative.parts or any(
            part in {"", ".", ".."} for part in relative.parts
        ):
            return False
        if item.get("type") not in {"SERVER_JS", "HTML", "JSON"}:
            return False
    try:
        validate_files(files, script_id)
    except CaseInsensitiveNameConflict:
        return False
    return True


def _normalize_now(now: datetime | None) -> datetime:
    current = now if now is not None else datetime.now(timezone.utc)
    if current.tzinfo is None or current.utcoffset() is None:
        raise ValueError("Stage 2 now must be timezone-aware")
    return current.astimezone(timezone.utc)


def _format_utc_timestamp(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def _parse_timestamp(value: str) -> datetime | None:
    text = value[:-1] + "+00:00" if value.endswith("Z") else value
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        return None
    return parsed.astimezone(timezone.utc)


def _metadata_reconciliation_decision(
    checkpoint: str | None,
    now: datetime,
) -> tuple[bool, str]:
    if not checkpoint:
        return True, "no-reconciliation-checkpoint"
    parsed = _parse_timestamp(checkpoint)
    if parsed is None:
        return True, "invalid-reconciliation-checkpoint"
    age = now - parsed
    if age.total_seconds() < 0:
        return True, "reconciliation-checkpoint-in-future"
    if age >= RECONCILIATION_INTERVAL:
        return True, "reconciliation-age-at-least-24h"
    return False, "reconciliation-age-under-24h"


def build_plan(
    root: Path | str | None,
    access_token: str,
    *,
    api: Any = None,
    now: datetime | None = None,
) -> dict[str, Any]:
    """Inspect every eligible canonical project and return a deterministic plan."""
    api = api or apps_script_api
    base = Path(root).resolve() if root is not None else REPO_ROOT
    current_time = _normalize_now(now)
    current_time_text = _format_utc_timestamp(current_time)
    projects: list[dict[str, Any]] = []
    stats = {
        "activeProjects": 0,
        "filesObserved": 0,
        "filesNotObserved": 0,
        "deploymentsObserved": 0,
        "deploymentsNotObserved": 0,
        "versionsObserved": 0,
        "versionsNotObserved": 0,
        "metadataReconciliationsDue": 0,
    }

    for project_dir in iter_project_directories(base):
        # The canonical directory name is the registry key. Stage 2 inspection
        # must not make `.clasp.json` an authority for remote project identity.
        script_id = project_dir.name
        metadata = load_metadata(project_dir, allow_missing=True)
        lifecycle = drive_lifecycle(metadata)
        checkpoint = materialized_update_time(metadata)
        reconciliation_checkpoint = deployment_version_reconciliation_checkpoint(metadata)

        if lifecycle == "absent":
            projects.append({
                "scriptId": script_id,
                "path": project_dir.relative_to(base).as_posix(),
                "lifecycle": lifecycle,
                "observation": None,
                "materialization": {
                    "required": False,
                    "reason": "drive-inventory-absent",
                    "checkpointAppsScriptUpdateTime": checkpoint,
                    "observedAppsScriptUpdateTime": None,
                },
                "metadataReconciliation": {
                    "due": False,
                    "reason": "drive-inventory-absent",
                    "checkpointAt": reconciliation_checkpoint,
                    "observedAt": None,
                },
            })
            continue

        stats["activeProjects"] += 1
        remote_project = api.get_project(script_id, access_token)
        remote_update_time = None
        if isinstance(remote_project.get("updateTime"), str) and remote_project["updateTime"]:
            remote_update_time = remote_project["updateTime"]
        required, reason = _materialization_decision(checkpoint, remote_update_time)
        reconciliation_due, reconciliation_reason = _metadata_reconciliation_decision(
            reconciliation_checkpoint,
            current_time,
        )

        observation: dict[str, Any] = {
            "appsScriptApi": remote_project,
            "observationState": {
                "files": "not-observed",
                "deployments": "not-observed",
                "versions": "not-observed",
            },
        }
        if required or not _canonical_files_reusable(metadata, script_id):
            files = _sort_files(api.get_project_files_metadata(script_id, access_token))
            validate_files(files, script_id)
            observation["observationState"]["files"] = "observed"
            observation["files"] = files
            stats["filesObserved"] += 1
        else:
            stats["filesNotObserved"] += 1

        reconciliation_observed_at = None
        if reconciliation_due:
            # The two metadata families form one reconciliation unit. A failure
            # in either request aborts Stage 2, so no plan reaches Stage 3 with
            # only one family freshly reconciled.
            deployments = _sort_deployments(api.list_deployments(script_id, access_token))
            versions = _sort_versions(api.list_versions(script_id, access_token))
            observation["observationState"]["deployments"] = "observed"
            observation["observationState"]["versions"] = "observed"
            observation["deployments"] = deployments
            observation["versions"] = versions
            reconciliation_observed_at = current_time_text
            stats["deploymentsObserved"] += 1
            stats["versionsObserved"] += 1
            stats["metadataReconciliationsDue"] += 1
        else:
            stats["deploymentsNotObserved"] += 1
            stats["versionsNotObserved"] += 1

        projects.append({
            "scriptId": script_id,
            "path": project_dir.relative_to(base).as_posix(),
            "lifecycle": lifecycle,
            "observation": observation,
            "materialization": {
                "required": required,
                "reason": reason,
                "checkpointAppsScriptUpdateTime": checkpoint,
                "observedAppsScriptUpdateTime": remote_update_time,
            },
            "metadataReconciliation": {
                "due": reconciliation_due,
                "reason": reconciliation_reason,
                "checkpointAt": reconciliation_checkpoint,
                "observedAt": reconciliation_observed_at,
            },
        })

    return {
        "schemaVersion": 2,
        "materializationRequired": any(
            project["materialization"]["required"] for project in projects
        ),
        "observationStats": stats,
        "projects": projects,
    }


def write_json(payload: dict[str, Any], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Inspect Apps Script projects and plan source materialization.")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        access_token = acquire_access_token()
        plan = build_plan(None, access_token)
    except (GoogleOAuthError, apps_script_api.AppsScriptApiError, CaseInsensitiveNameConflict, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    write_json(plan, args.output)
    selected = sum(1 for project in plan["projects"] if project["materialization"]["required"])
    stats = plan["observationStats"]
    print(
        f"Stage 2 inspection selected {selected}/{len(plan['projects'])} project(s) for materialization; "
        f"files observed/skipped={stats['filesObserved']}/{stats['filesNotObserved']}; "
        f"deployment/version reconciliations due={stats['metadataReconciliationsDue']}; "
        f"deployments observed/skipped={stats['deploymentsObserved']}/{stats['deploymentsNotObserved']}; "
        f"versions observed/skipped={stats['versionsObserved']}/{stats['versionsNotObserved']}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

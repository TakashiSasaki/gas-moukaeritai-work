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
from pathlib import Path
from types import ModuleType
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from automation.shared.google_oauth import GoogleOAuthError, acquire_access_token
from automation.shared.project_registry import iter_project_directories, load_metadata
from automation.shared.project_validation import CaseInsensitiveNameConflict, validate_files


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


def build_plan(
    root: Path | str | None,
    access_token: str,
    *,
    api: Any = None,
) -> dict[str, Any]:
    """Inspect every eligible canonical project and return a deterministic plan."""
    api = api or apps_script_api
    base = Path(root).resolve() if root is not None else REPO_ROOT
    projects: list[dict[str, Any]] = []

    for project_dir in iter_project_directories(base):
        # The canonical directory name is the registry key. Stage 2 inspection
        # must not make `.clasp.json` an authority for remote project identity.
        script_id = project_dir.name
        metadata = load_metadata(project_dir, allow_missing=True)
        lifecycle = drive_lifecycle(metadata)
        checkpoint = materialized_update_time(metadata)

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
            })
            continue

        remote_project = api.get_project(script_id, access_token)
        files = _sort_files(api.get_project_files_metadata(script_id, access_token))
        validate_files(files, script_id)
        deployments = _sort_deployments(api.list_deployments(script_id, access_token))
        versions = _sort_versions(api.list_versions(script_id, access_token))

        remote_update_time = None
        if isinstance(remote_project.get("updateTime"), str) and remote_project["updateTime"]:
            remote_update_time = remote_project["updateTime"]
        required, reason = _materialization_decision(checkpoint, remote_update_time)

        projects.append({
            "scriptId": script_id,
            "path": project_dir.relative_to(base).as_posix(),
            "lifecycle": lifecycle,
            "observation": {
                "appsScriptApi": remote_project,
                "observationState": {
                    "files": "observed",
                    "deployments": "observed",
                    "versions": "observed",
                },
                "files": files,
                "deployments": deployments,
                "versions": versions,
            },
            "materialization": {
                "required": required,
                "reason": reason,
                "checkpointAppsScriptUpdateTime": checkpoint,
                "observedAppsScriptUpdateTime": remote_update_time,
            },
        })

    return {
        "schemaVersion": 2,
        "materializationRequired": any(
            project["materialization"]["required"] for project in projects
        ),
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
    except (GoogleOAuthError, apps_script_api.AppsScriptApiError, CaseInsensitiveNameConflict) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    write_json(plan, args.output)
    selected = sum(1 for project in plan["projects"] if project["materialization"]["required"])
    print(f"Stage 2 inspection selected {selected}/{len(plan['projects'])} project(s) for materialization.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

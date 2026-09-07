#!/usr/bin/env python3
"""Reconcile a Drive inventory snapshot into canonical project registry state.

Stage 1 owns Drive observation and the Drive-derived project lifecycle. It
never deletes a canonical project directory merely because the project is
absent from the latest inventory.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
SNAPSHOT_PATTERN = re.compile(r"^\d{8}-\d{6}\.json$")
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from automation.shared.project_registry import (
    iter_project_directories,
    load_metadata,
    metadata_exists,
    project_path,
    project_repository_path,
    write_metadata,
)


def snapshot_directory(root: Path | None = None) -> Path:
    base = root if root is not None else REPO_ROOT
    return base / "data" / "inventory" / "drive-api" / "snapshots"


def latest_snapshot(root: Path | None = None) -> Path:
    directory = snapshot_directory(root)
    candidates = sorted(
        path for path in directory.iterdir()
        if path.is_file() and SNAPSHOT_PATTERN.fullmatch(path.name)
    )
    if not candidates:
        raise FileNotFoundError(f"No Drive inventory snapshots found in {directory}")
    return candidates[-1]


def load_snapshot_payload(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if not isinstance(payload, dict) or not isinstance(payload.get("files"), list):
        raise ValueError(f"Expected {{'files': [...]}} snapshot in {path}")
    return payload


def load_snapshot(path: Path) -> list[dict[str, Any]]:
    payload = load_snapshot_payload(path)
    return [item for item in payload["files"] if isinstance(item, dict)]


def _write_clasp(directory: Path, script_id: str) -> None:
    clasp_path = directory / ".clasp.json"
    if clasp_path.exists():
        return
    temporary = clasp_path.with_name(clasp_path.name + ".tmp")
    temporary.write_text(
        json.dumps(
            {"scriptId": script_id, "rootDir": "gas"},
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    os.replace(temporary, clasp_path)


def _set_drive_lifecycle(metadata: dict[str, Any], status: str) -> None:
    lifecycle = metadata.get("lifecycle")
    if not isinstance(lifecycle, dict):
        lifecycle = {}
        metadata["lifecycle"] = lifecycle
    lifecycle["driveInventory"] = status


def reconcile(snapshot: Path, root: Path | None = None) -> int:
    base = root if root is not None else REPO_ROOT
    reconciled = 0
    present_script_ids: set[str] = set()
    snapshot_payload = load_snapshot_payload(snapshot)
    snapshot_complete = snapshot_payload.get("complete") is True

    for item in (item for item in snapshot_payload["files"] if isinstance(item, dict)):
        script_id = item.get("id")
        name = item.get("name")
        if not isinstance(script_id, str) or not script_id or not name:
            continue

        directory = project_path(script_id, base)
        directory.mkdir(parents=True, exist_ok=True)
        is_new_metadata = not metadata_exists(directory)
        metadata = load_metadata(directory, allow_missing=True)

        drive_api = metadata.get("driveApi")
        if not isinstance(drive_api, dict):
            drive_api = {}
            metadata["driveApi"] = drive_api
        drive_api["id"] = script_id
        drive_api["name"] = name
        if item.get("createdTime"):
            drive_api["createdTime"] = item["createdTime"]
        if item.get("modifiedTime"):
            drive_api["modifiedTime"] = item["modifiedTime"]
        _set_drive_lifecycle(metadata, "present")

        if is_new_metadata:
            # New registry entries use the split layout immediately. `gas/`
            # remains absent until the first source materialization because Git
            # does not track empty directories.
            project_repository_path(directory).mkdir(parents=True, exist_ok=True)
            _write_clasp(directory, script_id)
        write_metadata(directory, metadata)
        present_script_ids.add(script_id)
        reconciled += 1

    # Negative lifecycle observations are authoritative only for snapshots that
    # explicitly prove exhaustive pagination. Historical/manual snapshots with
    # no `complete: true` marker can still prove presence, but can never prove
    # absence. This prevents truncated inventories from hiding active projects.
    if snapshot_complete:
        # The canonical directory name is itself the registry key. Do not depend
        # on `.clasp.json` to derive lifecycle: Stage 1 is Drive/repository-owned.
        for directory in iter_project_directories(base):
            if directory.name in present_script_ids:
                continue
            metadata = load_metadata(directory, allow_missing=True)
            _set_drive_lifecycle(metadata, "absent")
            write_metadata(directory, metadata)

    return reconciled


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "snapshot", nargs="?", type=Path,
        help="Drive inventory snapshot; defaults to the latest canonical snapshot",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    snapshot = args.snapshot or latest_snapshot()
    count = reconcile(snapshot)
    print(f"Reconciled {count} projects from {snapshot}")


if __name__ == "__main__":
    main()

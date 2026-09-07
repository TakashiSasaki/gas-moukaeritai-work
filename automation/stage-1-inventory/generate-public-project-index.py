#!/usr/bin/env python3
"""Generate the GitHub Pages project index from active project metadata."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from automation.shared.project_registry import iter_project_directories, load_metadata


def _is_present(metadata: dict[str, object]) -> bool:
    lifecycle = metadata.get("lifecycle")
    if isinstance(lifecycle, dict) and lifecycle.get("driveInventory") == "absent":
        return False
    # Missing lifecycle means pre-contract metadata and remains active until the
    # next Stage 1 reconciliation records an explicit observation.
    return True


def _string_or_none(value: object) -> str | None:
    return value if isinstance(value, str) and value else None


def build_index(root: Path | None = None) -> list[dict[str, Any]]:
    base = root if root is not None else REPO_ROOT
    entries: list[dict[str, Any]] = []
    for directory in iter_project_directories(base):
        metadata = load_metadata(directory, allow_missing=True)
        if not _is_present(metadata):
            continue

        drive_api = metadata.get("driveApi")
        apps_script_api = metadata.get("appsScriptApi")

        name = None
        created_at = None
        updated_at = None
        if isinstance(drive_api, dict):
            name = _string_or_none(drive_api.get("name"))
            created_at = _string_or_none(drive_api.get("createdTime"))
            updated_at = _string_or_none(drive_api.get("modifiedTime"))

        if not name and isinstance(apps_script_api, dict):
            name = _string_or_none(apps_script_api.get("title"))
        if not name:
            continue

        entries.append({
            "id": directory.name,
            "name": name,
            "createdAt": created_at,
            "updatedAt": updated_at,
            "hasReadme": (directory / "README.md").is_file(),
        })

    entries.sort(key=lambda item: (item["name"].lower(), item["id"]))
    return entries


def write_index(entries: list[dict[str, Any]], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_name(output.name + ".tmp")
    temporary.write_text(
        json.dumps(entries, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    os.replace(temporary, output)


def main() -> None:
    output = REPO_ROOT / "docs" / "projects.json"
    entries = build_index()
    write_index(entries, output)
    print(f"Published {len(entries)} projects to {output}")


if __name__ == "__main__":
    main()

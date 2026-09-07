#!/usr/bin/env python3
"""Explicitly migrate project directories to the split source/state layout.

The target layout is:

    projects/<SCRIPT_ID>/
      .clasp.json              # rootDir == "gas"
      README.md                # optional human-facing landing page
      gas/                     # GAS/clasp materialized files only
      repository/              # repository-owned state and supplemental assets
        metadata.json

The default mode is read-only. Pass ``--apply`` to perform the migration.
This utility is maintenance-only and is not part of steady-state Stage 1/2/3.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path
from types import ModuleType
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from automation.shared.project_registry import (
    ProjectRegistryError,
    get_script_id,
    iter_project_directories,
    load_clasp,
    load_metadata,
    metadata_path,
    project_repository_path,
    project_source_path,
    split_metadata_path,
)

GAS_SOURCE_SUFFIXES = {".js", ".html"}
GAS_MANIFEST = "appsscript.json"
ROOT_KEEP = {".clasp.json", "README.md"}
LEGACY_STANDALONE = {
    "deployments.json",
    "versions.json",
    "deployments.txt",
    "versions.txt",
}


class LayoutMigrationError(ValueError):
    """Raised when project layout state is unsafe or ambiguous to migrate."""


def _load_sibling(name: str, filename: str) -> ModuleType:
    path = Path(__file__).resolve().with_name(filename)
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load maintenance module: {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


legacy_migration = _load_sibling(
    "legacy_project_metadata_migration",
    "migrate-legacy-project-metadata.py",
)


def _read_clasp(project_dir: Path) -> dict[str, Any]:
    try:
        clasp = load_clasp(project_dir)
    except ProjectRegistryError as exc:
        raise LayoutMigrationError(str(exc)) from exc
    if get_script_id(project_dir) != project_dir.name:
        raise LayoutMigrationError(
            f"{project_dir.name}: .clasp.json scriptId does not match directory name"
        )
    return clasp


def _validate_special_directories(project_dir: Path) -> None:
    for path in (project_repository_path(project_dir), project_source_path(project_dir)):
        if path.is_symlink():
            raise LayoutMigrationError(f"{project_dir.name}: special directory is a symlink: {path.name}")
        if path.exists() and not path.is_dir():
            raise LayoutMigrationError(
                f"{project_dir.name}: special layout path is not a directory: {path.name}"
            )


def _validate_project_tree_no_symlinks(project_dir: Path) -> None:
    """Reject every symlink in the lexical project tree before reading or moving data."""
    pending = [project_dir]
    while pending:
        directory = pending.pop()
        for path in sorted(directory.iterdir(), key=lambda item: item.name):
            if path.is_symlink():
                relative = path.relative_to(project_dir).as_posix()
                raise LayoutMigrationError(
                    f"{project_dir.name}: project tree contains a symlink: {relative}"
                )
            if path.is_dir():
                pending.append(path)


def _validate_casefolded_destinations(
    project_dir: Path,
    destination_dir: Path,
    incoming_names: tuple[str, ...],
    *,
    label: str,
) -> None:
    """Reject destination names that would collide on case-insensitive filesystems."""
    existing: dict[str, str] = {}
    if destination_dir.exists():
        for entry in sorted(destination_dir.iterdir(), key=lambda item: item.name):
            folded = entry.name.casefold()
            previous = existing.get(folded)
            if previous is not None and previous != entry.name:
                raise LayoutMigrationError(
                    f"{project_dir.name}: {label}/ already contains a case-insensitive "
                    f"name collision: {previous} vs {entry.name}"
                )
            existing[folded] = entry.name

    planned: dict[str, str] = {}
    for name in incoming_names:
        folded = name.casefold()
        previous = planned.get(folded)
        if previous is not None:
            raise LayoutMigrationError(
                f"{project_dir.name}: migration would create a case-insensitive "
                f"{label}/ collision: {previous} vs {name}"
            )
        existing_name = existing.get(folded)
        if existing_name is not None:
            raise LayoutMigrationError(
                f"{project_dir.name}: case-insensitive destination collision: "
                f"{label}/{name} conflicts with existing {label}/{existing_name}"
            )
        planned[folded] = name


def _classify_root_entries(project_dir: Path) -> tuple[tuple[Path, ...], tuple[Path, ...]]:
    """Classify legacy root entries into GAS source and repository-owned data.

    Apps Script/clasp materialization is flat and consists of server-side
    JavaScript, HTML files, and the single ``appsscript.json`` manifest. Any
    other regular file or directory is therefore repository-owned supplemental
    state and moves under ``repository/``. Symlinks are rejected because their
    ownership and destination boundary cannot be proven lexically.
    """
    sources: list[Path] = []
    repository_entries: list[Path] = []
    excluded = ROOT_KEEP | LEGACY_STANDALONE | {"metadata.json", "repository", "gas"}
    for path in sorted(project_dir.iterdir(), key=lambda item: item.name):
        if path.is_symlink():
            raise LayoutMigrationError(
                f"{project_dir.name}: root symlink cannot be migrated safely: {path.name}"
            )
        if path.name in excluded:
            continue
        if path.is_file() and (
            path.suffix.lower() in GAS_SOURCE_SUFFIXES or path.name == GAS_MANIFEST
        ):
            sources.append(path)
        else:
            repository_entries.append(path)
    return tuple(sources), tuple(repository_entries)


def _legacy_notes(project_dir: Path) -> tuple[bool, tuple[str, ...]]:
    changed, notes = legacy_migration.migrate_project(project_dir, apply=False)
    conflicts = [note for note in notes if note.startswith("conflict:")]
    if conflicts:
        raise LayoutMigrationError(
            f"{project_dir.name}: legacy metadata conflicts: {'; '.join(conflicts)}"
        )
    return changed, tuple(notes)


def plan_project(project_dir: Path) -> dict[str, Any]:
    if project_dir.is_symlink() or not project_dir.is_dir():
        raise LayoutMigrationError(f"invalid canonical project directory: {project_dir}")
    _validate_project_tree_no_symlinks(project_dir)
    _validate_special_directories(project_dir)
    clasp = _read_clasp(project_dir)
    # Force metadata parsing/ambiguity checks before constructing any plan.
    load_metadata(project_dir, allow_missing=False)
    legacy_changed, legacy_notes = _legacy_notes(project_dir)
    sources, repository_entries = _classify_root_entries(project_dir)

    current_metadata = metadata_path(project_dir)
    target_metadata = split_metadata_path(project_dir)
    metadata_move = current_metadata != target_metadata

    source_root = project_source_path(project_dir)
    _validate_casefolded_destinations(
        project_dir,
        source_root,
        tuple(source.name for source in sources),
        label="gas",
    )
    for source in sources:
        destination = source_root / source.name
        if destination.exists():
            raise LayoutMigrationError(
                f"{project_dir.name}: source destination already exists: gas/{source.name}"
            )

    repository_root = project_repository_path(project_dir)
    repository_incoming = [entry.name for entry in repository_entries]
    if metadata_move:
        repository_incoming.append("metadata.json")
    _validate_casefolded_destinations(
        project_dir,
        repository_root,
        tuple(repository_incoming),
        label="repository",
    )
    for entry in repository_entries:
        destination = repository_root / entry.name
        if destination.exists():
            raise LayoutMigrationError(
                f"{project_dir.name}: repository destination already exists: repository/{entry.name}"
            )

    root_dir_change = clasp.get("rootDir") != "gas"
    actions: list[str] = []
    actions.extend(legacy_notes)
    if metadata_move:
        actions.append("move metadata.json -> repository/metadata.json")
    for source in sources:
        actions.append(f"move {source.name} -> gas/{source.name}")
    for entry in repository_entries:
        actions.append(f"move {entry.name} -> repository/{entry.name}")
    if root_dir_change:
        actions.append("set .clasp.json rootDir -> gas")

    return {
        "scriptId": project_dir.name,
        "changed": bool(
            legacy_changed
            or metadata_move
            or sources
            or repository_entries
            or root_dir_change
        ),
        "actions": actions,
        "sourceFiles": [source.name for source in sources],
        "repositoryEntries": [entry.name for entry in repository_entries],
    }


def _write_clasp(project_dir: Path, clasp: dict[str, Any]) -> None:
    destination = project_dir / ".clasp.json"
    temporary = destination.with_name(destination.name + ".tmp")
    temporary.write_text(
        json.dumps(clasp, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    os.replace(temporary, destination)


def _apply_project_without_backup(project_dir: Path) -> None:
    # Re-check immediately before mutation so excluded legacy/control names cannot
    # be swapped to symlinks after the dry-run planner has validated the tree.
    _validate_project_tree_no_symlinks(project_dir)
    # The dry-run planner has already rejected metadata conflicts. Apply legacy
    # consolidation first so standalone deployment/version files disappear
    # before generic repository-owned entries are moved.
    legacy_migration.migrate_project(project_dir, apply=True)

    current_metadata = metadata_path(project_dir)
    repository_root = project_repository_path(project_dir)
    target_metadata = split_metadata_path(project_dir)
    if current_metadata != target_metadata:
        _validate_casefolded_destinations(
            project_dir,
            repository_root,
            ("metadata.json",),
            label="repository",
        )
        repository_root.mkdir(parents=True, exist_ok=True)
        if target_metadata.exists():
            raise LayoutMigrationError(
                f"{project_dir.name}: split metadata destination already exists"
            )
        current_metadata.replace(target_metadata)

    sources, repository_entries = _classify_root_entries(project_dir)
    source_root = project_source_path(project_dir)
    _validate_casefolded_destinations(
        project_dir,
        source_root,
        tuple(source.name for source in sources),
        label="gas",
    )
    if sources:
        source_root.mkdir(parents=True, exist_ok=True)
        for source in sources:
            destination = source_root / source.name
            if destination.exists():
                raise LayoutMigrationError(
                    f"{project_dir.name}: source destination already exists: gas/{source.name}"
                )
            source.replace(destination)

    _validate_casefolded_destinations(
        project_dir,
        repository_root,
        tuple(entry.name for entry in repository_entries),
        label="repository",
    )
    if repository_entries:
        repository_root.mkdir(parents=True, exist_ok=True)
        for entry in repository_entries:
            destination = repository_root / entry.name
            if destination.exists():
                raise LayoutMigrationError(
                    f"{project_dir.name}: repository destination already exists: repository/{entry.name}"
                )
            entry.replace(destination)

    clasp = _read_clasp(project_dir)
    clasp["rootDir"] = "gas"
    _write_clasp(project_dir, clasp)


def apply_project(project_dir: Path) -> dict[str, Any]:
    plan = plan_project(project_dir)
    if not plan["changed"]:
        return plan

    with tempfile.TemporaryDirectory(prefix="gas-layout-migration-") as temporary:
        backup = Path(temporary) / "project"
        shutil.copytree(project_dir, backup, symlinks=True)
        try:
            _apply_project_without_backup(project_dir)
            post = plan_project(project_dir)
            if post["changed"]:
                raise LayoutMigrationError(
                    f"{project_dir.name}: migration did not converge: {post['actions']}"
                )
        except Exception:
            if project_dir.exists():
                shutil.rmtree(project_dir)
            shutil.copytree(backup, project_dir, symlinks=True)
            raise
    return plan


def run(
    root: Path | None = None,
    *,
    apply: bool = False,
    script_ids: set[str] | None = None,
) -> int:
    base = root if root is not None else REPO_ROOT
    affected = 0
    errors: list[str] = []
    for project_dir in iter_project_directories(base):
        if script_ids is not None and project_dir.name not in script_ids:
            continue
        try:
            plan = apply_project(project_dir) if apply else plan_project(project_dir)
        except (LayoutMigrationError, ProjectRegistryError, OSError, ValueError) as exc:
            errors.append(str(exc))
            print(f"[ERROR] {project_dir.name}: {exc}", file=sys.stderr)
            continue
        if not plan["changed"]:
            continue
        affected += 1
        mode = "APPLY" if apply else "DRY-RUN"
        print(f"[{mode}] {project_dir.name}")
        for action in plan["actions"]:
            print(f"  - {action}")

    if script_ids is not None:
        known = {path.name for path in iter_project_directories(base)}
        missing = sorted(script_ids - known)
        if missing:
            errors.append(f"unknown project id(s): {', '.join(missing)}")
            print(f"[ERROR] unknown project id(s): {', '.join(missing)}", file=sys.stderr)

    if errors:
        raise LayoutMigrationError(
            f"layout migration encountered {len(errors)} project error(s)"
        )
    return affected


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Persist the split-layout migration; default is read-only",
    )
    parser.add_argument(
        "--project",
        action="append",
        default=None,
        help="Limit migration to one Script ID; may be repeated",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        affected = run(
            apply=args.apply,
            script_ids=set(args.project) if args.project else None,
        )
    except LayoutMigrationError as exc:
        print(f"Layout migration failed: {exc}", file=sys.stderr)
        return 1
    mode = "migrated" if args.apply else "would migrate"
    print(f"Project layout migration {mode} {affected} project(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

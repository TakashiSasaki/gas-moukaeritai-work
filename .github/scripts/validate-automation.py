#!/usr/bin/env python3
"""Read-only baseline validation for the repository automation state."""

from __future__ import annotations

import ast
import importlib
import json
import sys
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
PROJECTS_DIR = REPOSITORY_ROOT / "projects"
DOCS_PROJECTS = REPOSITORY_ROOT / "docs" / "projects.json"
PROJECT_ROOT_ALLOWED = {".clasp.json", "README.md", "gas", "repository"}

if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from automation.shared.project_registry import (
    legacy_metadata_path,
    project_repository_path,
    project_source_path,
    split_metadata_path,
)


class Validation:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def error(self, message: str) -> None:
        self.errors.append(message)

    def warning(self, message: str) -> None:
        self.warnings.append(message)


def load_json(path: Path, validation: Validation):
    if path.is_symlink():
        validation.error(f"JSON path must not be a symlink: {path.relative_to(REPOSITORY_ROOT)}")
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        validation.error(f"invalid JSON: {path.relative_to(REPOSITORY_ROOT)}: {exc}")
        return None


def _iter_files_without_following_symlinks(
    root: Path,
    *,
    suffix: str | None = None,
) -> tuple[Path, ...]:
    """Return files below root without following any symlink component."""
    if not root.exists() or root.is_symlink() or not root.is_dir():
        return ()
    files: list[Path] = []
    pending = [root]
    while pending:
        directory = pending.pop()
        for entry in sorted(directory.iterdir(), key=lambda item: item.name):
            if entry.is_symlink():
                continue
            if entry.is_dir():
                pending.append(entry)
            elif entry.is_file() and (suffix is None or entry.suffix == suffix):
                files.append(entry)
    return tuple(sorted(files))


def _project_symlinks(project_dir: Path) -> tuple[Path, ...]:
    """Return symlinks under one lexical project tree without dereferencing them."""
    if project_dir.is_symlink() or not project_dir.is_dir():
        return (project_dir,) if project_dir.is_symlink() else ()
    symlinks: list[Path] = []
    pending = [project_dir]
    while pending:
        directory = pending.pop()
        for entry in sorted(directory.iterdir(), key=lambda item: item.name):
            if entry.is_symlink():
                symlinks.append(entry)
            elif entry.is_dir():
                pending.append(entry)
    return tuple(sorted(symlinks))


def validate_python(validation: Validation) -> None:
    roots = [
        REPOSITORY_ROOT / "automation",
        REPOSITORY_ROOT / ".github" / "scripts",
    ]
    python_files = sorted(path for root in roots if root.exists() for path in root.rglob("*.py"))
    imported_roots: set[str] = set()

    for path in python_files:
        relative = path.relative_to(REPOSITORY_ROOT)
        try:
            source = path.read_text(encoding="utf-8")
            tree = ast.parse(source, filename=str(relative))
            compile(tree, str(relative), "exec")
        except (OSError, UnicodeError, SyntaxError) as exc:
            validation.error(f"Python syntax/read failure: {relative}: {exc}")
            continue

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                imported_roots.update(alias.name.split(".", 1)[0] for alias in node.names)
            elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
                imported_roots.add(node.module.split(".", 1)[0])

    for module_name in sorted(imported_roots):
        try:
            importlib.import_module(module_name)
        except ImportError as exc:
            validation.error(f"unresolved Python import {module_name!r}: {exc}")

    print(f"Validated Python syntax/import roots for {len(python_files)} files.")


def validate_json_files(validation: Validation) -> None:
    project_json_files = _iter_files_without_following_symlinks(PROJECTS_DIR, suffix=".json")
    other_roots = [
        REPOSITORY_ROOT / "docs",
        REPOSITORY_ROOT / "data",
    ]
    other_json_files = sorted(
        path for root in other_roots if root.exists() for path in root.rglob("*.json")
    )
    json_files = tuple(sorted((*project_json_files, *other_json_files)))
    for path in json_files:
        load_json(path, validation)
    print(f"Validated JSON syntax for {len(json_files)} files.")


def validate_projects(validation: Validation) -> tuple[set[str], set[str]]:
    if PROJECTS_DIR.is_symlink():
        validation.error("projects/ directory must not be a symlink")
        return set(), set()
    if not PROJECTS_DIR.is_dir():
        validation.error("projects/ directory is missing")
        return set(), set()

    project_ids: set[str] = set()
    mismatched_directory_names: set[str] = set()
    project_dirs = sorted(path for path in PROJECTS_DIR.iterdir() if path.is_dir())

    if not project_dirs:
        validation.error("projects/ contains no project directories")

    for project_dir in project_dirs:
        relative_project = project_dir.relative_to(REPOSITORY_ROOT)
        clasp_path = project_dir / ".clasp.json"
        metadata_path = split_metadata_path(project_dir)
        legacy_metadata = legacy_metadata_path(project_dir)
        repository_dir = project_repository_path(project_dir)
        source_dir = project_source_path(project_dir)

        if project_dir.is_symlink():
            validation.error(f"project directory must not be a symlink: {relative_project}")
            continue

        symlinks = _project_symlinks(project_dir)
        for symlink in symlinks:
            validation.error(
                f"project tree must not contain symlinks: {symlink.relative_to(REPOSITORY_ROOT)}"
            )

        if clasp_path.is_symlink():
            validation.error(f".clasp.json must not be a symlink: {relative_project}")
            clasp = None
        elif not clasp_path.is_file():
            validation.error(f"missing .clasp.json: {relative_project}")
            clasp = None
        else:
            clasp = load_json(clasp_path, validation)

        if repository_dir.is_symlink() or not repository_dir.is_dir():
            validation.error(f"missing/invalid repository/ directory: {relative_project}")
        if metadata_path.is_symlink():
            validation.error(f"repository/metadata.json must not be a symlink: {relative_project}")
            metadata = None
        elif not metadata_path.is_file():
            validation.error(f"missing repository/metadata.json: {relative_project}")
            metadata = None
        else:
            metadata = load_json(metadata_path, validation)
        if legacy_metadata.is_symlink():
            validation.error(f"legacy root metadata.json must not be a symlink: {relative_project}")
        elif legacy_metadata.exists():
            validation.error(f"legacy root metadata.json remains after split-layout cutover: {relative_project}")
        if source_dir.exists() and (source_dir.is_symlink() or not source_dir.is_dir()):
            validation.error(f"invalid gas/ source directory: {relative_project}")

        for entry in sorted(project_dir.iterdir(), key=lambda item: item.name):
            if entry.name not in PROJECT_ROOT_ALLOWED:
                validation.error(
                    f"unexpected project-root entry after split-layout cutover: "
                    f"{entry.relative_to(REPOSITORY_ROOT)}"
                )

        if not isinstance(clasp, dict):
            if clasp is not None:
                validation.error(f".clasp.json must contain an object: {clasp_path.relative_to(REPOSITORY_ROOT)}")
            continue

        script_id = clasp.get("scriptId")
        if not isinstance(script_id, str) or not script_id:
            validation.error(f"missing/invalid scriptId: {clasp_path.relative_to(REPOSITORY_ROOT)}")
            continue

        root_dir = clasp.get("rootDir")
        if root_dir != "gas":
            validation.error(
                f".clasp.json rootDir must be 'gas' after split-layout cutover: "
                f"{clasp_path.relative_to(REPOSITORY_ROOT)}"
            )

        if script_id in project_ids:
            validation.error(f"duplicate scriptId in projects/: {script_id}")
        project_ids.add(script_id)

        if project_dir.name != script_id:
            mismatched_directory_names.add(project_dir.name)
            validation.warning(
                f"directory name differs from .clasp.json scriptId: {project_dir.name!r} != {script_id!r}"
            )

        if metadata is not None and not isinstance(metadata, dict):
            validation.error(f"metadata.json must contain an object: {metadata_path.relative_to(REPOSITORY_ROOT)}")
        elif isinstance(metadata, dict):
            drive_api = metadata.get("driveApi")
            if isinstance(drive_api, dict) and isinstance(drive_api.get("id"), str):
                if drive_api["id"] != script_id:
                    validation.error(
                        f"driveApi.id differs from .clasp.json scriptId in {project_dir.name}: "
                        f"{drive_api['id']!r} != {script_id!r}"
                    )

    print(f"Validated structure for {len(project_dirs)} project directories.")
    return project_ids, mismatched_directory_names


def validate_docs_projection(project_ids: set[str], validation: Validation) -> None:
    if not DOCS_PROJECTS.is_file():
        validation.error("docs/projects.json is missing")
        return

    payload = load_json(DOCS_PROJECTS, validation)
    if isinstance(payload, list):
        entries = payload
    elif isinstance(payload, dict) and isinstance(payload.get("projects"), list):
        entries = payload["projects"]
    else:
        validation.error("docs/projects.json must be a project list or an object containing a projects list")
        return

    documented_ids: set[str] = set()
    for index, entry in enumerate(entries):
        if not isinstance(entry, dict):
            validation.error(f"docs/projects.json entry {index} is not an object")
            continue
        script_id = entry.get("id") or entry.get("scriptId")
        if not isinstance(script_id, str) or not script_id:
            validation.error(f"docs/projects.json entry {index} has no usable project id")
            continue
        if script_id in documented_ids:
            validation.error(f"duplicate project id in docs/projects.json: {script_id}")
        documented_ids.add(script_id)
        if script_id not in project_ids:
            validation.error(f"docs/projects.json references missing projects/{script_id}/")

    unprojected = project_ids - documented_ids
    if unprojected:
        validation.warning(
            f"{len(unprojected)} materialized project directories are absent from docs/projects.json; "
            "this remains baseline information rather than a structural validation failure"
        )

    print(f"Validated docs/projects.json references for {len(documented_ids)} projects.")


def main() -> int:
    validation = Validation()

    validate_python(validation)
    project_ids, mismatches = validate_projects(validation)
    validate_json_files(validation)
    validate_docs_projection(project_ids, validation)

    if mismatches:
        print(
            f"Baseline observation: {len(mismatches)} project directories do not match their scriptId; "
            "the canonical-name invariant is not yet enforced."
        )

    for warning in validation.warnings:
        print(f"WARNING: {warning}", file=sys.stderr)
    for error in validation.errors:
        print(f"ERROR: {error}", file=sys.stderr)

    if validation.errors:
        print(f"Automation validation failed with {len(validation.errors)} error(s).", file=sys.stderr)
        return 1

    print(f"Automation validation passed with {len(validation.warnings)} warning(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

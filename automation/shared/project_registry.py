"""Repository-access primitives for materialized Apps Script projects.

This module deliberately contains no Drive API, Apps Script API, clasp, change
detection, or documentation-generation business logic.
"""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path
from typing import Any


class ProjectRegistryError(ValueError):
    """Raised when repository project state is malformed or unsafe to access."""


_DEFAULT_REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
_SPLIT_REPOSITORY_DIRNAME = "repository"
_SPLIT_SOURCE_DIRNAME = "gas"
_METADATA_FILENAME = "metadata.json"


def repository_root() -> Path:
    """Return the repository root containing this automation package."""
    return _DEFAULT_REPOSITORY_ROOT


def projects_path(root: Path | str | None = None) -> Path:
    """Return the canonical `projects/` path for a repository root."""
    base = Path(root).resolve() if root is not None else repository_root()
    return base / "projects"


def iter_project_directories(root: Path | str | None = None) -> tuple[Path, ...]:
    """Return canonical project directories in deterministic name order."""
    base = projects_path(root)
    if not base.exists():
        return ()
    if base.is_symlink():
        raise ProjectRegistryError(f"projects path must not be a symlink: {base}")
    if not base.is_dir():
        raise ProjectRegistryError(f"projects path is not a directory: {base}")

    directories: list[Path] = []
    for path in base.iterdir():
        if path.is_symlink():
            raise ProjectRegistryError(f"project entry must not be a symlink: {path}")
        if path.is_dir():
            directories.append(path)
    return tuple(sorted(directories, key=lambda path: path.name))


def _validate_script_id(script_id: str) -> str:
    if not isinstance(script_id, str) or not script_id:
        raise ProjectRegistryError("scriptId must be a non-empty string")
    if script_id in {".", ".."} or Path(script_id).name != script_id or "/" in script_id or "\\" in script_id:
        raise ProjectRegistryError(f"scriptId is not safe as a project directory name: {script_id!r}")
    return script_id


def project_path(script_id: str, root: Path | str | None = None) -> Path:
    """Build the canonical `projects/<SCRIPT_ID>/` path without creating it."""
    return projects_path(root) / _validate_script_id(script_id)


def project_repository_path(project_dir: Path | str) -> Path:
    """Return the split-layout repository-owned state directory."""
    return Path(project_dir) / _SPLIT_REPOSITORY_DIRNAME


def project_source_path(project_dir: Path | str) -> Path:
    """Return the split-layout GAS/clasp materialization directory."""
    return Path(project_dir) / _SPLIT_SOURCE_DIRNAME


def legacy_metadata_path(project_dir: Path | str) -> Path:
    """Return the pre-split project-root metadata path."""
    return Path(project_dir) / _METADATA_FILENAME


def split_metadata_path(project_dir: Path | str) -> Path:
    """Return the split-layout repository metadata path."""
    return project_repository_path(project_dir) / _METADATA_FILENAME


def _reject_symlink(path: Path, label: str) -> None:
    if path.is_symlink():
        raise ProjectRegistryError(f"{label} must not be a symlink: {path}")


def metadata_path(project_dir: Path | str) -> Path:
    """Resolve the single canonical metadata path during layout migration.

    Existing metadata determines an already-materialized layout. Split metadata
    wins only when it is the sole metadata file; legacy metadata remains readable
    and writable while the repository-wide migration is in flight. If neither
    metadata file exists, the canonical destination is the split layout so every
    newly discovered project is created directly in the target structure. Having
    both metadata files is ambiguous and rejected fail-closed.
    """
    directory = Path(project_dir)
    _reject_symlink(directory, "project directory")

    legacy = legacy_metadata_path(directory)
    split = split_metadata_path(directory)
    repository_dir = project_repository_path(directory)

    _reject_symlink(repository_dir, "split repository directory")
    _reject_symlink(legacy, "legacy metadata file")
    _reject_symlink(split, "split metadata file")

    legacy_exists = legacy.exists()
    split_exists = split.exists()
    if legacy_exists and split_exists:
        raise ProjectRegistryError(
            f"ambiguous project metadata: both {legacy} and {split} exist"
        )
    if split_exists:
        return split
    if legacy_exists:
        return legacy

    if repository_dir.exists() and not repository_dir.is_dir():
        raise ProjectRegistryError(
            f"split repository path is not a directory: {repository_dir}"
        )
    return split


def metadata_exists(project_dir: Path | str) -> bool:
    """Return whether the project has metadata in exactly one supported layout."""
    return metadata_path(project_dir).exists()


def _load_json_object(path: Path, *, allow_missing: bool = False) -> dict[str, Any]:
    _reject_symlink(path, "repository JSON file")
    if allow_missing and not path.exists():
        return {}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ProjectRegistryError(f"required repository file is missing: {path}") from exc
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ProjectRegistryError(f"cannot read JSON object from {path}: {exc}") from exc
    if not isinstance(payload, dict):
        raise ProjectRegistryError(f"expected a JSON object in {path}")
    return payload


def load_clasp(project_dir: Path | str) -> dict[str, Any]:
    """Read and validate a project's `.clasp.json` object."""
    directory = Path(project_dir)
    _reject_symlink(directory, "project directory")
    clasp_path = directory / ".clasp.json"
    _reject_symlink(clasp_path, ".clasp.json")
    return _load_json_object(clasp_path)


def get_script_id(project_dir: Path | str) -> str:
    """Read the project's non-empty `scriptId` from `.clasp.json`."""
    payload = load_clasp(project_dir)
    script_id = payload.get("scriptId")
    return _validate_script_id(script_id)


def load_metadata(project_dir: Path | str, *, allow_missing: bool = False) -> dict[str, Any]:
    """Read a project's canonical metadata object.

    During the split-layout migration this accepts either legacy
    `metadata.json` or split `repository/metadata.json`, but never both.
    `allow_missing=True` is intended for Stage 1 while materializing a newly
    discovered project. It does not suppress malformed, ambiguous, or symlinked
    metadata state.
    """
    return _load_json_object(metadata_path(project_dir), allow_missing=allow_missing)


def write_metadata(project_dir: Path | str, metadata: dict[str, Any]) -> None:
    """Atomically replace canonical metadata with deterministic UTF-8 JSON.

    Existing split projects keep writing `repository/metadata.json`; existing
    legacy projects keep writing root `metadata.json`. Projects with no metadata
    yet are written directly to `repository/metadata.json`.
    """
    directory = Path(project_dir)
    _reject_symlink(directory, "project directory")
    if not directory.is_dir():
        raise ProjectRegistryError(f"project directory does not exist: {directory}")
    if not isinstance(metadata, dict):
        raise ProjectRegistryError("metadata must be a JSON object")

    destination = metadata_path(directory)
    serialized = json.dumps(metadata, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    temporary_name: str | None = None
    try:
        destination.parent.mkdir(parents=True, exist_ok=True)
        _reject_symlink(destination.parent, "metadata parent directory")
        _reject_symlink(destination, "metadata file")
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=destination.parent,
            prefix=".metadata.json.",
            suffix=".tmp",
            delete=False,
        ) as temporary:
            temporary.write(serialized)
            temporary_name = temporary.name
        os.replace(temporary_name, destination)
    except (OSError, ProjectRegistryError) as exc:
        if temporary_name is not None:
            try:
                Path(temporary_name).unlink(missing_ok=True)
            except OSError:
                pass
        if isinstance(exc, ProjectRegistryError):
            raise
        raise ProjectRegistryError(f"cannot write metadata to {destination}: {exc}") from exc

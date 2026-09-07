#!/usr/bin/env python3
"""Materialize and finalize Stage 2 observations transactionally per project."""

from __future__ import annotations

import argparse
import importlib.util
import json
import shutil
import sys
import tempfile
from pathlib import Path, PurePosixPath, PureWindowsPath
from types import ModuleType
from typing import Any, Callable

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from automation.shared.project_registry import (
    ProjectRegistryError,
    get_script_id,
    load_clasp,
    load_metadata,
    project_path,
    projects_path,
    write_metadata,
)
from automation.shared.project_validation import (
    CaseInsensitiveNameConflict,
    validate_files,
    windows_case_insensitive_key,
)


def _load_sibling(name: str, filename: str) -> ModuleType:
    path = Path(__file__).resolve().with_name(filename)
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load Stage 3 module: {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


clasp_client = _load_sibling("stage3_clasp_client", "clasp_client.py")


class MaterializationPlanError(ValueError):
    """Raised before source changes when a Stage 2 plan is unsafe or stale."""


class PostPullValidationError(RuntimeError):
    """Raised when clasp reports success but the resulting project tree is invalid."""


_EXTENSION_BY_TYPE = {"SERVER_JS": ".js", "HTML": ".html", "JSON": ".json"}
_OBSERVATION_FAMILIES = ("files", "deployments", "versions")
_OBSERVATION_STATES = {"observed", "not-observed"}


def _optional_timestamp(value: Any, label: str, script_id: str) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str) or not value:
        raise MaterializationPlanError(f"{script_id}: {label} must be a non-empty string or null")
    return value


def _current_checkpoint(metadata: dict[str, Any], script_id: str) -> str | None:
    if "syncState" in metadata:
        sync_state = metadata["syncState"]
        if not isinstance(sync_state, dict):
            raise MaterializationPlanError(f"{script_id}: metadata syncState must be an object")
        return _optional_timestamp(
            sync_state.get("lastMaterializedAppsScriptUpdateTime"),
            "metadata syncState.lastMaterializedAppsScriptUpdateTime",
            script_id,
        )
    apps_script = metadata.get("appsScriptApi")
    if isinstance(apps_script, dict) and apps_script.get("updateTime") is not None:
        return _optional_timestamp(
            apps_script.get("updateTime"), "metadata appsScriptApi.updateTime", script_id
        )
    if metadata.get("lastUpdated") is not None:
        return _optional_timestamp(metadata.get("lastUpdated"), "metadata lastUpdated", script_id)
    return None


def _current_drive_lifecycle(metadata: dict[str, Any], script_id: str) -> str:
    lifecycle = metadata.get("lifecycle")
    if lifecycle is None:
        return "unknown"
    if not isinstance(lifecycle, dict):
        raise MaterializationPlanError(f"{script_id}: metadata lifecycle must be an object")
    value = lifecycle.get("driveInventory")
    if value is None:
        return "unknown"
    if value not in {"present", "absent"}:
        raise MaterializationPlanError(
            f"{script_id}: metadata lifecycle.driveInventory must be 'present' or 'absent'"
        )
    return str(value)


def _validate_object_list(value: Any, label: str, script_id: str) -> list[dict[str, Any]]:
    if not isinstance(value, list) or any(not isinstance(item, dict) for item in value):
        raise MaterializationPlanError(f"{script_id}: Stage 2 observation {label} must be an object list")
    return value


def _observation_states(observation: dict[str, Any], script_id: str) -> dict[str, str]:
    """Return explicit family freshness, accepting pre-marker plans as fully observed."""
    raw = observation.get("observationState")
    if raw is None:
        return {family: "observed" for family in _OBSERVATION_FAMILIES}
    if not isinstance(raw, dict):
        raise MaterializationPlanError(
            f"{script_id}: observation.observationState must be an object"
        )
    if set(raw) != set(_OBSERVATION_FAMILIES):
        raise MaterializationPlanError(
            f"{script_id}: observation.observationState must declare exactly "
            f"{', '.join(_OBSERVATION_FAMILIES)}"
        )
    states: dict[str, str] = {}
    for family in _OBSERVATION_FAMILIES:
        state = raw.get(family)
        if state not in _OBSERVATION_STATES:
            raise MaterializationPlanError(
                f"{script_id}: observation.observationState.{family} must be "
                "'observed' or 'not-observed'"
            )
        states[family] = str(state)
    return states


def _source_relative_path(file_metadata: dict[str, Any], script_id: str) -> PurePosixPath:
    name = file_metadata.get("name")
    file_type = file_metadata.get("type")
    if not isinstance(name, str) or not name:
        raise PostPullValidationError(f"{script_id}: observed Apps Script file is missing a name")
    if "\\" in name:
        raise PostPullValidationError(
            f"{script_id}: observed Apps Script filename contains a backslash: {name!r}"
        )
    relative = PurePosixPath(name)
    if relative.is_absolute() or not relative.parts or any(
        part in {"", ".", ".."} for part in relative.parts
    ):
        raise PostPullValidationError(
            f"{script_id}: observed Apps Script filename is not a safe relative path: {name!r}"
        )
    extension = _EXTENSION_BY_TYPE.get(file_type)
    if extension is None:
        raise PostPullValidationError(
            f"{script_id}: unsupported Apps Script file type for validation: {file_type!r}"
        )
    return PurePosixPath(str(relative) + extension)


def _source_root(project_dir: Path, script_id: str) -> Path:
    try:
        clasp = load_clasp(project_dir)
    except ProjectRegistryError as exc:
        raise PostPullValidationError(f"{script_id}: invalid .clasp.json: {exc}") from exc
    root_dir = clasp.get("rootDir", ".")
    if not isinstance(root_dir, str) or not root_dir:
        raise PostPullValidationError(
            f"{script_id}: .clasp.json rootDir must be a non-empty string"
        )

    windows_path = PureWindowsPath(root_dir)
    if windows_path.drive:
        raise PostPullValidationError(
            f"{script_id}: .clasp.json rootDir must not be drive-qualified: {root_dir!r}"
        )
    normalized = PurePosixPath(root_dir.replace("\\", "/"))
    if normalized.is_absolute() or any(part == ".." for part in normalized.parts):
        raise PostPullValidationError(
            f"{script_id}: .clasp.json rootDir escapes the project: {root_dir!r}"
        )

    root = project_dir.joinpath(
        *[part for part in normalized.parts if part not in {"", "."}]
    )
    try:
        root.resolve().relative_to(project_dir.resolve())
    except (OSError, ValueError) as exc:
        raise PostPullValidationError(
            f"{script_id}: .clasp.json rootDir escapes the project: {root_dir!r}"
        ) from exc
    return root


def _assert_no_symlink_components(
    path: Path,
    boundary: Path,
    script_id: str,
    *,
    allow_leaf_symlink: bool = False,
) -> None:
    """Reject existing symlinks that could redirect a project-local operation."""
    try:
        relative = path.relative_to(boundary)
    except ValueError as exc:
        raise PostPullValidationError(
            f"{script_id}: source path is outside the canonical project: {path}"
        ) from exc

    current = boundary
    parts = relative.parts
    for index, part in enumerate(parts):
        current = current / part
        if current.is_symlink():
            is_leaf = index == len(parts) - 1
            if allow_leaf_symlink and is_leaf:
                return
            raise PostPullValidationError(
                f"{script_id}: source path contains a symlink before materialization: {current}"
            )
        if not current.exists():
            break


def _assert_no_windows_case_aliases(
    path: Path,
    boundary: Path,
    script_id: str,
) -> None:
    """Reject existing lexical aliases that collide under Windows comparison."""
    try:
        relative = path.relative_to(boundary)
    except ValueError as exc:
        raise PostPullValidationError(
            f"{script_id}: source path is outside the canonical project: {path}"
        ) from exc

    parent = boundary
    for part in relative.parts:
        if not parent.exists():
            return
        if not parent.is_dir():
            raise PostPullValidationError(
                f"{script_id}: source path parent is not a directory: {parent}"
            )
        comparison_key = windows_case_insensitive_key(part)
        try:
            aliases = sorted(
                entry.name
                for entry in parent.iterdir()
                if entry.name != part
                and windows_case_insensitive_key(entry.name) == comparison_key
            )
        except OSError as exc:
            raise PostPullValidationError(
                f"{script_id}: cannot inspect source path parent {parent}: {exc}"
            ) from exc
        if aliases:
            raise PostPullValidationError(
                f"{script_id}: source path component {part!r} conflicts with existing "
                f"Windows case alias(es) {aliases!r} in {parent}"
            )
        parent = parent / part


def _tracked_source_paths(files: Any, source_root: Path, script_id: str) -> set[Path]:
    """Return lexical tracked source paths without dereferencing their leaves."""
    if not isinstance(files, list):
        return set()
    tracked: set[Path] = set()
    for item in files:
        if not isinstance(item, dict):
            continue
        try:
            relative = _source_relative_path(item, script_id)
        except PostPullValidationError:
            continue
        tracked.add(source_root.joinpath(*relative.parts))
    return tracked


def _validate_existing_materialization_paths(
    project_dir: Path,
    script_id: str,
    old_metadata: dict[str, Any],
    observation: dict[str, Any],
) -> None:
    """Ensure clasp cannot redirect or case-alias a project-local source write."""
    source_root = _source_root(project_dir, script_id)
    _assert_no_symlink_components(source_root, project_dir, script_id)
    _assert_no_windows_case_aliases(source_root, project_dir, script_id)

    for destination in _tracked_source_paths(observation.get("files"), source_root, script_id):
        _assert_no_symlink_components(destination, project_dir, script_id)
        _assert_no_windows_case_aliases(destination, project_dir, script_id)

    # A stale tracked source may itself be a symlink; cleanup can safely unlink
    # that lexical leaf, but no parent component may redirect the operation.
    for destination in _tracked_source_paths(old_metadata.get("files"), source_root, script_id):
        _assert_no_symlink_components(
            destination,
            project_dir,
            script_id,
            allow_leaf_symlink=True,
        )
        _assert_no_windows_case_aliases(destination, project_dir, script_id)


def _expected_materialization_required(
    checkpoint: str | None,
    observed_update_time: str | None,
) -> bool:
    if checkpoint is None:
        return True
    if observed_update_time is None:
        return True
    return checkpoint != observed_update_time


def _validate_observation(item: dict[str, Any], script_id: str) -> dict[str, Any] | None:
    lifecycle = item.get("lifecycle")
    required = item["materialization"]["required"]
    observation = item.get("observation")
    if lifecycle == "absent":
        if required:
            raise MaterializationPlanError(
                f"{script_id}: absent project must not require materialization"
            )
        if observation is not None:
            raise MaterializationPlanError(
                f"{script_id}: absent project must not carry an Apps Script observation"
            )
        return None

    if not isinstance(observation, dict):
        raise MaterializationPlanError(f"{script_id}: active project needs a Stage 2 observation")
    apps_script = observation.get("appsScriptApi")
    if not isinstance(apps_script, dict):
        raise MaterializationPlanError(
            f"{script_id}: observation.appsScriptApi must be an object"
        )
    observed_script_id = apps_script.get("scriptId")
    if not isinstance(observed_script_id, str) or not observed_script_id:
        raise MaterializationPlanError(
            f"{script_id}: observation.appsScriptApi.scriptId must be a non-empty string"
        )
    if observed_script_id != script_id:
        raise MaterializationPlanError(
            f"{script_id}: observation Apps Script project belongs to {observed_script_id!r}"
        )

    states = _observation_states(observation, script_id)
    family_values: dict[str, list[dict[str, Any]]] = {}
    for family in _OBSERVATION_FAMILIES:
        if states[family] == "observed":
            family_values[family] = _validate_object_list(
                observation.get(family), family, script_id
            )
        elif family in observation:
            raise MaterializationPlanError(
                f"{script_id}: not-observed {family} must omit its observation payload"
            )

    if required and states["files"] != "observed":
        raise MaterializationPlanError(
            f"{script_id}: required materialization needs an observed files family"
        )

    files = family_values.get("files")
    if files is not None:
        try:
            validate_files(files, script_id)
            for file_metadata in files:
                _source_relative_path(file_metadata, script_id)
        except (CaseInsensitiveNameConflict, PostPullValidationError) as exc:
            raise MaterializationPlanError(
                f"{script_id}: unsafe Stage 2 file observation: {exc}"
            ) from exc

    materialization = item["materialization"]
    planned_observed = _optional_timestamp(
        materialization.get("observedAppsScriptUpdateTime"),
        "materialization.observedAppsScriptUpdateTime",
        script_id,
    )
    remote_observed = _optional_timestamp(
        apps_script.get("updateTime"),
        "observation.appsScriptApi.updateTime",
        script_id,
    )
    if planned_observed != remote_observed:
        raise MaterializationPlanError(
            f"{script_id}: plan observed updateTime {planned_observed!r} does not match "
            f"observation.appsScriptApi.updateTime {remote_observed!r}"
        )
    return observation


def _validate_canonical_project(project_dir: Path, base: Path, script_id: str) -> None:
    canonical_projects = projects_path(base)
    if canonical_projects.is_symlink():
        raise MaterializationPlanError("canonical projects/ directory must not be a symlink")
    if not canonical_projects.is_dir():
        raise MaterializationPlanError("canonical projects/ directory is missing")
    try:
        resolved_projects = canonical_projects.resolve()
        if resolved_projects.parent != base.resolve():
            raise MaterializationPlanError(
                "canonical projects/ directory escapes the repository root"
            )
    except OSError as exc:
        raise MaterializationPlanError(
            f"cannot resolve canonical projects/ directory: {exc}"
        ) from exc

    if project_dir.is_symlink():
        raise MaterializationPlanError(
            f"{script_id}: canonical project directory must not be a symlink"
        )
    if not project_dir.is_dir():
        raise MaterializationPlanError(
            f"{script_id}: canonical project directory is missing"
        )
    try:
        resolved = project_dir.resolve()
    except OSError as exc:
        raise MaterializationPlanError(
            f"{script_id}: cannot resolve canonical project directory: {exc}"
        ) from exc
    if resolved.parent != resolved_projects or resolved.name != script_id:
        raise MaterializationPlanError(
            f"{script_id}: canonical project directory resolves outside projects/<SCRIPT_ID>"
        )


def _plan_projects(plan: dict[str, Any], base: Path) -> list[dict[str, Any]]:
    if plan.get("schemaVersion") != 1:
        raise MaterializationPlanError("Stage 2 plan schemaVersion must be 1")
    projects = plan.get("projects")
    if not isinstance(projects, list):
        raise MaterializationPlanError("Stage 2 plan projects must be a list")
    if not isinstance(plan.get("materializationRequired"), bool):
        raise MaterializationPlanError(
            "Stage 2 plan materializationRequired must be a boolean"
        )

    validated: list[dict[str, Any]] = []
    seen: set[str] = set()
    for item in projects:
        if not isinstance(item, dict):
            raise MaterializationPlanError(
                "each Stage 2 plan project must be an object"
            )
        script_id = item.get("scriptId")
        if not isinstance(script_id, str) or not script_id:
            raise MaterializationPlanError("Stage 2 plan project is missing scriptId")
        if script_id in seen:
            raise MaterializationPlanError(
                f"duplicate Stage 2 plan project: {script_id}"
            )
        seen.add(script_id)

        planned_lifecycle = item.get("lifecycle")
        if planned_lifecycle not in {"present", "absent", "unknown"}:
            raise MaterializationPlanError(
                f"{script_id}: plan lifecycle must be 'present', 'absent', or 'unknown'"
            )
        materialization = item.get("materialization")
        if not isinstance(materialization, dict) or not isinstance(
            materialization.get("required"), bool
        ):
            raise MaterializationPlanError(
                f"{script_id}: materialization.required must be a boolean"
            )
        planned_checkpoint = _optional_timestamp(
            materialization.get("checkpointAppsScriptUpdateTime"),
            "materialization.checkpointAppsScriptUpdateTime",
            script_id,
        )

        canonical = project_path(script_id, base)
        expected_path = canonical.relative_to(base).as_posix()
        if item.get("path") != expected_path:
            raise MaterializationPlanError(
                f"{script_id}: plan path {item.get('path')!r} does not match canonical {expected_path!r}"
            )
        _validate_canonical_project(canonical, base, script_id)

        metadata = load_metadata(canonical, allow_missing=True)
        current_lifecycle = _current_drive_lifecycle(metadata, script_id)
        # A concrete current Drive state is authoritative and must still match
        # the Stage 2 observation. Legacy metadata without lifecycle remains
        # "unknown" and carries no evidence of a present->absent transition.
        if current_lifecycle != "unknown" and current_lifecycle != planned_lifecycle:
            raise MaterializationPlanError(
                f"{script_id}: stale Stage 2 plan lifecycle {planned_lifecycle!r}; "
                f"current repository lifecycle is {current_lifecycle!r}"
            )
        current_checkpoint = _current_checkpoint(metadata, script_id)
        if current_checkpoint != planned_checkpoint:
            raise MaterializationPlanError(
                f"{script_id}: stale Stage 2 plan checkpoint {planned_checkpoint!r}; "
                f"current repository checkpoint is {current_checkpoint!r}"
            )

        observation = _validate_observation(item, script_id)
        if planned_lifecycle != "absent":
            planned_observed = _optional_timestamp(
                materialization.get("observedAppsScriptUpdateTime"),
                "materialization.observedAppsScriptUpdateTime",
                script_id,
            )
            expected_required = _expected_materialization_required(
                planned_checkpoint,
                planned_observed,
            )
            if materialization["required"] != expected_required:
                raise MaterializationPlanError(
                    f"{script_id}: materialization.required={materialization['required']!r} "
                    f"is inconsistent with checkpoint {planned_checkpoint!r} and "
                    f"observed updateTime {planned_observed!r}"
                )

        if materialization["required"]:
            try:
                if get_script_id(canonical) != script_id:
                    raise MaterializationPlanError(
                        f"{script_id}: .clasp.json scriptId does not match the canonical project directory"
                    )
                if not isinstance(observation, dict):
                    raise MaterializationPlanError(
                        f"{script_id}: required materialization needs an Apps Script observation"
                    )
                _validate_existing_materialization_paths(
                    canonical,
                    script_id,
                    metadata,
                    observation,
                )
            except (ProjectRegistryError, PostPullValidationError) as exc:
                raise MaterializationPlanError(
                    f"{script_id}: invalid clasp materialization target: {exc}"
                ) from exc
        validated.append(item)

    expected_any = any(
        item["materialization"]["required"] for item in validated
    )
    if plan["materializationRequired"] != expected_any:
        raise MaterializationPlanError(
            "Stage 2 plan materializationRequired does not match its project decisions"
        )
    return validated


def _remove_stale_tracked_sources(
    project_dir: Path,
    script_id: str,
    old_metadata: dict[str, Any],
    observation: dict[str, Any],
) -> None:
    source_root = _source_root(project_dir, script_id)
    _assert_no_symlink_components(source_root, project_dir, script_id)
    _assert_no_windows_case_aliases(source_root, project_dir, script_id)
    old_paths = _tracked_source_paths(
        old_metadata.get("files"), source_root, script_id
    )
    new_paths = _tracked_source_paths(
        observation.get("files"), source_root, script_id
    )
    for stale in sorted(old_paths - new_paths, key=lambda path: str(path)):
        _assert_no_symlink_components(
            stale,
            project_dir,
            script_id,
            allow_leaf_symlink=True,
        )
        _assert_no_windows_case_aliases(stale, project_dir, script_id)
        if stale.is_symlink():
            stale.unlink()
        elif stale.is_file():
            stale.unlink()


def validate_post_pull(
    project_dir: Path,
    script_id: str,
    observation: dict[str, Any],
) -> None:
    try:
        materialized_script_id = get_script_id(project_dir)
    except ProjectRegistryError as exc:
        raise PostPullValidationError(
            f"{script_id}: invalid post-pull .clasp.json: {exc}"
        ) from exc
    if materialized_script_id != script_id:
        raise PostPullValidationError(
            f"{script_id}: post-pull .clasp.json scriptId changed to {materialized_script_id!r}"
        )
    files = observation.get("files")
    if not isinstance(files, list) or any(not isinstance(item, dict) for item in files):
        raise PostPullValidationError(
            f"{script_id}: Stage 2 observation files must be an object list"
        )
    try:
        validate_files(files, script_id)
    except CaseInsensitiveNameConflict as exc:
        raise PostPullValidationError(str(exc)) from exc

    source_root = _source_root(project_dir, script_id)
    _assert_no_symlink_components(source_root, project_dir, script_id)
    _assert_no_windows_case_aliases(source_root, project_dir, script_id)
    if not source_root.is_dir():
        raise PostPullValidationError(
            f"{script_id}: clasp rootDir was not materialized: {source_root}"
        )
    for file_metadata in files:
        relative = _source_relative_path(file_metadata, script_id)
        destination = source_root.joinpath(*relative.parts)
        _assert_no_symlink_components(destination, project_dir, script_id)
        _assert_no_windows_case_aliases(destination, project_dir, script_id)
        if not destination.is_file():
            raise PostPullValidationError(
                f"{script_id}: clasp pull did not materialize observed source file {relative.as_posix()!r}"
            )


def _metadata_from_observation(
    current: dict[str, Any],
    item: dict[str, Any],
    script_id: str,
) -> dict[str, Any]:
    observation = item.get("observation")
    if not isinstance(observation, dict):
        raise MaterializationPlanError(
            f"{script_id}: cannot finalize without Stage 2 observation"
        )
    result = dict(current)
    checkpoint = _current_checkpoint(current, script_id)
    sync_state = result.get("syncState")
    if sync_state is None:
        sync_state = {}
    elif not isinstance(sync_state, dict):
        raise MaterializationPlanError(
            f"{script_id}: metadata syncState must be an object"
        )
    else:
        sync_state = dict(sync_state)
    if checkpoint is not None:
        sync_state["lastMaterializedAppsScriptUpdateTime"] = checkpoint
    result["syncState"] = sync_state

    result["appsScriptApi"] = dict(observation["appsScriptApi"])
    states = _observation_states(observation, script_id)
    for family in _OBSERVATION_FAMILIES:
        if states[family] == "observed":
            result[family] = [dict(value) for value in observation[family]]
    if item["materialization"]["required"]:
        observed = _optional_timestamp(
            item["materialization"].get("observedAppsScriptUpdateTime"),
            "materialization.observedAppsScriptUpdateTime",
            script_id,
        )
        if observed is not None:
            sync_state["lastMaterializedAppsScriptUpdateTime"] = observed
    return result


def _restore_project(project_dir: Path, backup: Path) -> None:
    try:
        if project_dir.is_symlink():
            project_dir.unlink()
        elif project_dir.exists():
            shutil.rmtree(project_dir)
        shutil.copytree(backup, project_dir, symlinks=True)
    except OSError as exc:
        raise RuntimeError(
            f"failed to restore {project_dir} after materialization failure: {exc}"
        ) from exc


def _result(script_id: str, required: bool) -> dict[str, Any]:
    return {
        "scriptId": script_id,
        "required": required,
        "attempted": False,
        "materialized": False,
        "finalized": False,
        "successful": False,
        "error": None,
    }


def materialize_plan(
    plan: dict[str, Any],
    root: Path | str | None = None,
    *,
    clasp: Any = None,
    metadata_writer: Callable[[Path | str, dict[str, Any]], None] = write_metadata,
) -> dict[str, Any]:
    clasp = clasp or clasp_client
    base = Path(root).resolve() if root is not None else REPO_ROOT
    projects = _plan_projects(plan, base)
    results: list[dict[str, Any]] = []

    for item in projects:
        script_id = item["scriptId"]
        required = item["materialization"]["required"]
        lifecycle = item.get("lifecycle")
        result = _result(script_id, required)
        if lifecycle == "absent":
            result["successful"] = True
            results.append(result)
            continue

        project_dir = project_path(script_id, base)
        old_metadata = load_metadata(project_dir, allow_missing=True)
        observation = item["observation"]
        if not required:
            try:
                metadata_writer(
                    project_dir,
                    _metadata_from_observation(old_metadata, item, script_id),
                )
                result["finalized"] = True
                result["successful"] = True
            except Exception as exc:
                result["error"] = str(exc)
                print(
                    f"Error: projects/{script_id} observation finalization failed: {exc}",
                    file=sys.stderr,
                )
            results.append(result)
            continue

        result["attempted"] = True
        with tempfile.TemporaryDirectory(prefix="gas-stage3-") as temporary:
            backup = Path(temporary) / "project-backup"
            shutil.copytree(project_dir, backup, symlinks=True)
            try:
                clasp.pull(project_dir)
                # Validate the complete observed destination set before stale
                # cleanup so cleanup cannot hide a malformed pull result.
                validate_post_pull(project_dir, script_id, observation)
                _remove_stale_tracked_sources(
                    project_dir,
                    script_id,
                    old_metadata,
                    observation,
                )
                metadata_writer(
                    project_dir,
                    _metadata_from_observation(old_metadata, item, script_id),
                )
                result["materialized"] = True
                result["finalized"] = True
                result["successful"] = True
            except Exception as exc:
                try:
                    _restore_project(project_dir, backup)
                except Exception as restore_exc:
                    raise RuntimeError(
                        f"{script_id}: materialization failed ({exc}) and rollback also failed ({restore_exc})"
                    ) from restore_exc
                result["error"] = str(exc)
                print(
                    f"Error: projects/{script_id} transaction rolled back: {exc}",
                    file=sys.stderr,
                )
        results.append(result)

    return {
        "schemaVersion": 1,
        "projects": results,
        "allRequiredMaterialized": all(
            (not item["required"]) or item["materialized"] for item in results
        ),
        "allProjectsSuccessful": all(item["successful"] for item in results),
    }


def read_json(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise MaterializationPlanError(f"expected JSON object in {path}")
    return payload


def write_json(payload: dict[str, Any], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Transactionally apply a Stage 2 materialization plan."
    )
    parser.add_argument("--plan", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = materialize_plan(read_json(args.plan))
    except (MaterializationPlanError, ProjectRegistryError, RuntimeError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    write_json(result, args.output)
    attempted = sum(1 for item in result["projects"] if item["attempted"])
    failed = sum(1 for item in result["projects"] if not item["successful"])
    print(
        f"Stage 3 attempted {attempted} pull(s); {failed} project transaction(s) failed."
    )
    return 0 if result["allProjectsSuccessful"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

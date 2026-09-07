#!/usr/bin/env python3
"""Capture and compare read-only Apps Script API change-signal snapshots.

This diagnostic intentionally reuses the Stage 2 Apps Script API client. It does
not invoke clasp, mutate Apps Script state, or write canonical project state.
Its purpose is to test whether Project.updateTime is a sufficient invalidation
signal for the more specific file/deployment/version observations.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from types import ModuleType
from typing import Any, Callable

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from automation.shared.google_oauth import GoogleOAuthError, acquire_access_token


def _load_sibling(name: str, filename: str) -> ModuleType:
    path = Path(__file__).resolve().with_name(filename)
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load Stage 2 diagnostic dependency: {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


apps_script_api = _load_sibling("stage2_diagnostic_apps_script_api", "apps_script_api.py")


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def _fingerprint(value: Any) -> str:
    return hashlib.sha256(_canonical_json(value).encode("utf-8")).hexdigest()


def _stable_sort(items: list[dict[str, Any]], *keys: str) -> list[dict[str, Any]]:
    return sorted(
        items,
        key=lambda item: tuple(str(item.get(key, "")) for key in keys)
        + (_canonical_json(item),),
    )


def _rfc3339(timestamp: datetime) -> str:
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    return timestamp.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def _valid_rfc3339_timestamp(value: Any) -> str | None:
    """Return a non-empty timezone-aware RFC3339-like timestamp or None."""
    if not isinstance(value, str) or not value:
        return None
    normalized = value[:-1] + "+00:00" if value.endswith("Z") else value
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return None
    return value


def _capture_status(before: Any, after: Any) -> tuple[str, str | None]:
    before_time = _valid_rfc3339_timestamp(before)
    after_time = _valid_rfc3339_timestamp(after)
    if before_time is None or after_time is None:
        return "project-update-time-unavailable", None
    if before_time != after_time:
        return "project-update-time-changed-during-capture", None
    return "stable", before_time


def capture_snapshot(
    script_id: str,
    access_token: str,
    *,
    api: Any = None,
    now: Callable[[], datetime] = _utc_now,
) -> dict[str, Any]:
    """Capture one bracketed Stage 2 observation for a single script project."""
    if not isinstance(script_id, str) or not script_id.strip():
        raise ValueError("script_id must be a non-empty string")

    api = api or apps_script_api
    remote_project_before = api.get_project(script_id, access_token)
    files = _stable_sort(api.get_project_files_metadata(script_id, access_token), "name", "type")
    deployments = _stable_sort(api.list_deployments(script_id, access_token), "deploymentId")
    versions = _stable_sort(api.list_versions(script_id, access_token), "versionNumber")
    remote_project_after = api.get_project(script_id, access_token)

    before_update_time = remote_project_before.get("updateTime")
    after_update_time = remote_project_after.get("updateTime")
    capture_status, stable_update_time = _capture_status(
        before_update_time,
        after_update_time,
    )

    observations = {
        "project": remote_project_after,
        "files": files,
        "deployments": deployments,
        "versions": versions,
    }
    return {
        "schemaVersion": 2,
        "kind": "apps-script-change-signal-snapshot",
        "scriptId": script_id,
        "observedAt": _rfc3339(now()),
        "captureStatus": capture_status,
        "captureConclusive": capture_status == "stable",
        "projectUpdateTime": stable_update_time,
        "projectUpdateTimeBracket": {
            "before": before_update_time,
            "after": after_update_time,
        },
        "fingerprints": {
            section: _fingerprint(value) for section, value in observations.items()
        },
        "observations": observations,
    }


def _load_snapshot(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ValueError(f"cannot read diagnostic snapshot {path}: {exc}") from exc
    if not isinstance(payload, dict):
        raise ValueError(f"diagnostic snapshot must be an object: {path}")
    if payload.get("schemaVersion") != 2 or payload.get("kind") != "apps-script-change-signal-snapshot":
        raise ValueError(f"unsupported diagnostic snapshot schema: {path}")
    if not isinstance(payload.get("scriptId"), str) or not payload["scriptId"]:
        raise ValueError(f"diagnostic snapshot has no scriptId: {path}")

    status = payload.get("captureStatus")
    conclusive = payload.get("captureConclusive")
    bracket = payload.get("projectUpdateTimeBracket")
    if status not in {
        "stable",
        "project-update-time-unavailable",
        "project-update-time-changed-during-capture",
    }:
        raise ValueError(f"diagnostic snapshot has invalid captureStatus: {path}")
    if not isinstance(conclusive, bool) or conclusive is not (status == "stable"):
        raise ValueError(f"diagnostic snapshot has inconsistent captureConclusive: {path}")
    if not isinstance(bracket, dict):
        raise ValueError(f"diagnostic snapshot has no projectUpdateTimeBracket: {path}")

    expected_status, expected_update_time = _capture_status(
        bracket.get("before"),
        bracket.get("after"),
    )
    if status != expected_status or payload.get("projectUpdateTime") != expected_update_time:
        raise ValueError(f"diagnostic snapshot has inconsistent Project.updateTime bracket: {path}")

    fingerprints = payload.get("fingerprints")
    observations = payload.get("observations")
    if not isinstance(fingerprints, dict) or not isinstance(observations, dict):
        raise ValueError(f"diagnostic snapshot is missing observations/fingerprints: {path}")
    for section in ("project", "files", "deployments", "versions"):
        if section not in observations or fingerprints.get(section) != _fingerprint(observations[section]):
            raise ValueError(f"diagnostic snapshot fingerprint mismatch for {section}: {path}")
    return payload


def _comparison_inconclusive_reasons(
    before: dict[str, Any],
    after: dict[str, Any],
) -> list[str]:
    reasons: list[str] = []
    for label, snapshot in (("before", before), ("after", after)):
        status = snapshot.get("captureStatus")
        if status != "stable":
            reasons.append(f"{label}-{status or 'capture-status-unavailable'}")
            continue
        if _valid_rfc3339_timestamp(snapshot.get("projectUpdateTime")) is None:
            reasons.append(f"{label}-project-update-time-unavailable")
    return reasons


def compare_snapshots(before: dict[str, Any], after: dict[str, Any]) -> dict[str, Any]:
    """Compare two snapshots and surface only conclusive timestamp counterexamples."""
    before_id = before.get("scriptId")
    after_id = after.get("scriptId")
    if not isinstance(before_id, str) or not before_id or before_id != after_id:
        raise ValueError("diagnostic snapshots must refer to the same non-empty scriptId")

    before_fingerprints = before.get("fingerprints")
    after_fingerprints = after.get("fingerprints")
    if not isinstance(before_fingerprints, dict) or not isinstance(after_fingerprints, dict):
        raise ValueError("diagnostic snapshots must contain fingerprints")

    sections = {
        section: before_fingerprints.get(section) != after_fingerprints.get(section)
        for section in ("project", "files", "deployments", "versions")
    }
    before_update_time = _valid_rfc3339_timestamp(before.get("projectUpdateTime"))
    after_update_time = _valid_rfc3339_timestamp(after.get("projectUpdateTime"))
    inconclusive_reasons = _comparison_inconclusive_reasons(before, after)
    conclusive = not inconclusive_reasons
    project_update_time_changed = (
        before_update_time != after_update_time if conclusive else None
    )
    downstream_changed_without_project_update_time = (
        [
            section
            for section in ("files", "deployments", "versions")
            if sections[section] and project_update_time_changed is False
        ]
        if conclusive
        else []
    )

    if not conclusive:
        evaluation = "inconclusive"
        sufficient_for_transition: bool | None = None
    elif downstream_changed_without_project_update_time:
        evaluation = "counterexample-observed"
        sufficient_for_transition = False
    else:
        evaluation = "no-counterexample-observed"
        sufficient_for_transition = True

    return {
        "schemaVersion": 2,
        "kind": "apps-script-change-signal-comparison",
        "scriptId": before_id,
        "beforeObservedAt": before.get("observedAt"),
        "afterObservedAt": after.get("observedAt"),
        "conclusive": conclusive,
        "inconclusiveReasons": inconclusive_reasons,
        "counterexampleEvaluation": evaluation,
        "projectUpdateTime": {
            "before": before_update_time,
            "after": after_update_time,
            "changed": project_update_time_changed,
        },
        "sectionsChanged": sections,
        "downstreamChangedWithoutProjectUpdateTime": downstream_changed_without_project_update_time,
        "projectUpdateTimeSufficientForObservedTransition": sufficient_for_transition,
    }


def write_json(payload: dict[str, Any], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def _snapshot_command(args: argparse.Namespace) -> int:
    try:
        access_token = acquire_access_token()
        snapshot = capture_snapshot(args.script_id, access_token)
    except (GoogleOAuthError, apps_script_api.AppsScriptApiError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    write_json(snapshot, args.output)
    print(
        "Captured Apps Script change-signal snapshot for "
        f"{args.script_id}: captureStatus={snapshot['captureStatus']}, "
        f"project.updateTime={snapshot['projectUpdateTime']!r}"
    )
    return 0


def _compare_command(args: argparse.Namespace) -> int:
    try:
        before = _load_snapshot(args.before)
        after = _load_snapshot(args.after)
        comparison = compare_snapshots(before, after)
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    write_json(comparison, args.output)

    if not comparison["conclusive"]:
        print(
            "Comparison is inconclusive: "
            + ", ".join(comparison["inconclusiveReasons"])
        )
        return 0

    counterexamples = comparison["downstreamChangedWithoutProjectUpdateTime"]
    if counterexamples:
        print(
            "Observed downstream change(s) without Project.updateTime change: "
            + ", ".join(counterexamples)
        )
    else:
        print("No downstream-without-Project.updateTime counterexample observed in this comparison.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Capture or compare read-only Apps Script API change-signal diagnostics."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    snapshot_parser = subparsers.add_parser("snapshot", help="Capture one read-only API snapshot.")
    snapshot_parser.add_argument("--script-id", required=True)
    snapshot_parser.add_argument("--output", type=Path, required=True)
    snapshot_parser.set_defaults(handler=_snapshot_command)

    compare_parser = subparsers.add_parser("compare", help="Compare two diagnostic snapshots.")
    compare_parser.add_argument("--before", type=Path, required=True)
    compare_parser.add_argument("--after", type=Path, required=True)
    compare_parser.add_argument("--output", type=Path, required=True)
    compare_parser.set_defaults(handler=_compare_command)

    args = parser.parse_args()
    return int(args.handler(args))


if __name__ == "__main__":
    raise SystemExit(main())

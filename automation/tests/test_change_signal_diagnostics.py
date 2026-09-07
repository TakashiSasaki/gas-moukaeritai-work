from __future__ import annotations

import importlib.util
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
from types import ModuleType

REPO_ROOT = Path(__file__).resolve().parents[2]
DIAGNOSTIC_PATH = REPO_ROOT / "automation" / "stage-2-inspection" / "diagnose-change-signals.py"
WORKFLOW_PATH = REPO_ROOT / ".github" / "workflows" / "diagnose-apps-script-change-signals.yml"


def _load_module() -> ModuleType:
    spec = importlib.util.spec_from_file_location("test_change_signal_diagnostic", DIAGNOSTIC_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load diagnostic module: {DIAGNOSTIC_PATH}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


diagnostic = _load_module()


class FakeApi:
    def __init__(
        self,
        *,
        update_time: str = "2026-09-07T00:00:00Z",
        files: list[dict] | None = None,
        deployments: list[dict] | None = None,
        versions: list[dict] | None = None,
    ) -> None:
        self.update_time = update_time
        self.files = files if files is not None else [{"name": "Code", "type": "SERVER_JS", "updateTime": update_time}]
        self.deployments = deployments if deployments is not None else []
        self.versions = versions if versions is not None else []
        self.calls: list[tuple[str, str, str]] = []

    def get_project(self, script_id: str, access_token: str) -> dict:
        self.calls.append(("project", script_id, access_token))
        return {"scriptId": script_id, "title": "Diagnostic", "updateTime": self.update_time}

    def get_project_files_metadata(self, script_id: str, access_token: str) -> list[dict]:
        self.calls.append(("files", script_id, access_token))
        return list(self.files)

    def list_deployments(self, script_id: str, access_token: str) -> list[dict]:
        self.calls.append(("deployments", script_id, access_token))
        return list(self.deployments)

    def list_versions(self, script_id: str, access_token: str) -> list[dict]:
        self.calls.append(("versions", script_id, access_token))
        return list(self.versions)


def _now() -> datetime:
    return datetime(2026, 9, 7, 3, 0, tzinfo=timezone.utc)


class ChangeSignalDiagnosticTests(unittest.TestCase):
    def test_snapshot_observes_each_stage2_resource_family_once(self):
        api = FakeApi(
            files=[
                {"name": "Zed", "type": "HTML", "updateTime": "2"},
                {"name": "Alpha", "type": "SERVER_JS", "updateTime": "1"},
            ],
            deployments=[
                {"deploymentId": "d2", "updateTime": "2"},
                {"deploymentId": "d1", "updateTime": "1"},
            ],
            versions=[
                {"versionNumber": 2, "createTime": "2"},
                {"versionNumber": 1, "createTime": "1"},
            ],
        )

        snapshot = diagnostic.capture_snapshot(
            "script-123",
            "fake-access-token",
            api=api,
            now=_now,
        )

        self.assertEqual(
            [call[0] for call in api.calls],
            ["project", "files", "deployments", "versions"],
        )
        self.assertTrue(all(call[1] == "script-123" for call in api.calls))
        self.assertTrue(all(call[2] == "fake-access-token" for call in api.calls))
        self.assertEqual(snapshot["observedAt"], "2026-09-07T03:00:00Z")
        self.assertEqual([item["name"] for item in snapshot["observations"]["files"]], ["Alpha", "Zed"])
        self.assertEqual(
            [item["deploymentId"] for item in snapshot["observations"]["deployments"]],
            ["d1", "d2"],
        )
        self.assertEqual(
            [item["versionNumber"] for item in snapshot["observations"]["versions"]],
            [1, 2],
        )

    def test_deployment_change_without_project_update_time_is_counterexample(self):
        before = diagnostic.capture_snapshot(
            "script-123",
            "token",
            api=FakeApi(deployments=[{"deploymentId": "d1", "updateTime": "1"}]),
            now=_now,
        )
        after = diagnostic.capture_snapshot(
            "script-123",
            "token",
            api=FakeApi(deployments=[{"deploymentId": "d1", "updateTime": "2"}]),
            now=_now,
        )

        comparison = diagnostic.compare_snapshots(before, after)

        self.assertFalse(comparison["projectUpdateTime"]["changed"])
        self.assertTrue(comparison["sectionsChanged"]["deployments"])
        self.assertEqual(
            comparison["downstreamChangedWithoutProjectUpdateTime"],
            ["deployments"],
        )
        self.assertFalse(comparison["projectUpdateTimeSufficientForObservedTransition"])

    def test_version_change_without_project_update_time_is_counterexample(self):
        before = diagnostic.capture_snapshot(
            "script-123",
            "token",
            api=FakeApi(versions=[{"versionNumber": 1, "createTime": "1"}]),
            now=_now,
        )
        after = diagnostic.capture_snapshot(
            "script-123",
            "token",
            api=FakeApi(
                versions=[
                    {"versionNumber": 1, "createTime": "1"},
                    {"versionNumber": 2, "createTime": "2"},
                ]
            ),
            now=_now,
        )

        comparison = diagnostic.compare_snapshots(before, after)

        self.assertEqual(
            comparison["downstreamChangedWithoutProjectUpdateTime"],
            ["versions"],
        )
        self.assertFalse(comparison["projectUpdateTimeSufficientForObservedTransition"])

    def test_project_update_time_change_avoids_false_counterexample(self):
        before = diagnostic.capture_snapshot(
            "script-123",
            "token",
            api=FakeApi(update_time="2026-09-07T00:00:00Z"),
            now=_now,
        )
        after = diagnostic.capture_snapshot(
            "script-123",
            "token",
            api=FakeApi(update_time="2026-09-07T00:01:00Z"),
            now=_now,
        )

        comparison = diagnostic.compare_snapshots(before, after)

        self.assertTrue(comparison["projectUpdateTime"]["changed"])
        self.assertEqual(comparison["downstreamChangedWithoutProjectUpdateTime"], [])
        self.assertTrue(comparison["projectUpdateTimeSufficientForObservedTransition"])

    def test_comparison_rejects_different_script_ids(self):
        first = diagnostic.capture_snapshot("script-a", "token", api=FakeApi(), now=_now)
        second = diagnostic.capture_snapshot("script-b", "token", api=FakeApi(), now=_now)

        with self.assertRaisesRegex(ValueError, "same non-empty scriptId"):
            diagnostic.compare_snapshots(first, second)

    def test_diagnostic_workflow_is_manual_and_read_only(self):
        workflow = WORKFLOW_PATH.read_text(encoding="utf-8")

        self.assertIn("workflow_dispatch:", workflow)
        self.assertNotIn("schedule:", workflow)
        self.assertNotIn("workflow_run:", workflow)
        self.assertIn("contents: read", workflow)
        self.assertIn("actions: read", workflow)
        self.assertIn("baseline_run_id", workflow)
        self.assertIn("actions/upload-artifact@v4", workflow)
        self.assertIn("actions/download-artifact@v4", workflow)
        self.assertNotIn("clasp ", workflow)
        self.assertNotIn("git add", workflow)
        self.assertNotIn("git commit", workflow)
        self.assertNotIn("git push", workflow)
        self.assertNotIn("contents: write", workflow)


if __name__ == "__main__":
    unittest.main()

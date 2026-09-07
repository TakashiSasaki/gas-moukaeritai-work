from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
from types import ModuleType

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))


def load_module(name: str, relative_path: str) -> ModuleType:
    path = REPO_ROOT / relative_path
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


planner = load_module(
    "stage2_source_fast_path_planner_test",
    "automation/stage-2-inspection/plan-materialization.py",
)


class FakeInspectionApi:
    def __init__(self, *, project_update_time: str | None = "same"):
        self.project_update_time = project_update_time
        self.calls: list[str] = []

    def get_project(self, script_id, token):
        self.calls.append("project")
        payload = {"scriptId": script_id}
        if self.project_update_time is not None:
            payload["updateTime"] = self.project_update_time
        return payload

    def get_project_files_metadata(self, script_id, token):
        self.calls.append("files")
        return [{"name": "Remote", "type": "SERVER_JS", "updateTime": "remote-files"}]

    def list_deployments(self, script_id, token):
        self.calls.append("deployments")
        return [{"deploymentId": "deployment-1", "updateTime": "deployment-time"}]

    def list_versions(self, script_id, token):
        self.calls.append("versions")
        return [{"versionNumber": 1}]


def write_project(root: Path, metadata: dict) -> None:
    directory = root / "projects" / "script-1"
    directory.mkdir(parents=True)
    (directory / "metadata.json").write_text(json.dumps(metadata), encoding="utf-8")


def canonical_metadata(*, checkpoint: str = "same", files=...) -> dict:
    metadata = {
        "lifecycle": {"driveInventory": "present"},
        "syncState": {"lastMaterializedAppsScriptUpdateTime": checkpoint},
    }
    if files is ...:
        metadata["files"] = [{"name": "Canonical", "type": "SERVER_JS"}]
    elif files is not None:
        metadata["files"] = files
    return metadata


class Stage2SourceFastPathTests(unittest.TestCase):
    def test_matching_checkpoint_with_reusable_files_skips_file_metadata(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(root, canonical_metadata())
            api = FakeInspectionApi(project_update_time="same")

            plan = planner.build_plan(root, "token", api=api)
            item = plan["projects"][0]
            observation = item["observation"]

            self.assertFalse(item["materialization"]["required"])
            self.assertEqual("checkpoint-matches-remote", item["materialization"]["reason"])
            self.assertEqual("not-observed", observation["observationState"]["files"])
            self.assertNotIn("files", observation)
            self.assertEqual("observed", observation["observationState"]["deployments"])
            self.assertEqual("observed", observation["observationState"]["versions"])
            self.assertEqual(["project", "deployments", "versions"], api.calls)
            self.assertEqual(
                {
                    "activeProjects": 1,
                    "filesObserved": 0,
                    "filesNotObserved": 1,
                    "deploymentsObserved": 1,
                    "deploymentsNotObserved": 0,
                    "versionsObserved": 1,
                    "versionsNotObserved": 0,
                    "metadataReconciliationsDue": 1,
                },
                plan["observationStats"],
            )

    def test_changed_project_still_observes_files_before_materialization(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(root, canonical_metadata(checkpoint="old"))
            api = FakeInspectionApi(project_update_time="new")

            plan = planner.build_plan(root, "token", api=api)
            item = plan["projects"][0]
            observation = item["observation"]

            self.assertTrue(item["materialization"]["required"])
            self.assertEqual("remote-update-time-changed", item["materialization"]["reason"])
            self.assertEqual("observed", observation["observationState"]["files"])
            self.assertEqual("Remote", observation["files"][0]["name"])
            self.assertEqual(["project", "files", "deployments", "versions"], api.calls)
            self.assertEqual(1, plan["observationStats"]["filesObserved"])
            self.assertEqual(0, plan["observationStats"]["filesNotObserved"])

    def test_missing_remote_update_time_still_observes_files_fail_safe(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(root, canonical_metadata(checkpoint="old"))
            api = FakeInspectionApi(project_update_time=None)

            item = planner.build_plan(root, "token", api=api)["projects"][0]

            self.assertTrue(item["materialization"]["required"])
            self.assertEqual("remote-update-time-unavailable", item["materialization"]["reason"])
            self.assertEqual("observed", item["observation"]["observationState"]["files"])
            self.assertEqual(["project", "files", "deployments", "versions"], api.calls)

    def test_matching_checkpoint_with_missing_canonical_files_refreshes_metadata(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(root, canonical_metadata(files=None))
            api = FakeInspectionApi(project_update_time="same")

            item = planner.build_plan(root, "token", api=api)["projects"][0]

            self.assertFalse(item["materialization"]["required"])
            self.assertEqual("observed", item["observation"]["observationState"]["files"])
            self.assertIn("files", item["observation"])
            self.assertEqual(["project", "files", "deployments", "versions"], api.calls)

    def test_matching_checkpoint_with_invalid_canonical_files_refreshes_metadata(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(
                root,
                canonical_metadata(files=[{"name": "Bad", "type": "UNKNOWN"}]),
            )
            api = FakeInspectionApi(project_update_time="same")

            item = planner.build_plan(root, "token", api=api)["projects"][0]

            self.assertFalse(item["materialization"]["required"])
            self.assertEqual("observed", item["observation"]["observationState"]["files"])
            self.assertEqual(["project", "files", "deployments", "versions"], api.calls)

    def test_matching_checkpoint_with_unsafe_canonical_file_path_refreshes_metadata(self):
        for name in ("../Escape", "/Absolute", "Folder\\File", "Folder/../Escape", "."):
            with self.subTest(name=name), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                write_project(
                    root,
                    canonical_metadata(files=[{"name": name, "type": "SERVER_JS"}]),
                )
                api = FakeInspectionApi(project_update_time="same")

                item = planner.build_plan(root, "token", api=api)["projects"][0]

                self.assertFalse(item["materialization"]["required"])
                self.assertEqual(
                    "observed", item["observation"]["observationState"]["files"]
                )
                self.assertEqual(
                    ["project", "files", "deployments", "versions"], api.calls
                )

    def test_absent_project_does_not_affect_active_observation_stats(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            directory = root / "projects" / "script-1"
            directory.mkdir(parents=True)
            (directory / "metadata.json").write_text(
                json.dumps({"lifecycle": {"driveInventory": "absent"}}),
                encoding="utf-8",
            )
            api = FakeInspectionApi(project_update_time="same")

            plan = planner.build_plan(root, "token", api=api)

            self.assertEqual([], api.calls)
            self.assertEqual(
                {
                    "activeProjects": 0,
                    "filesObserved": 0,
                    "filesNotObserved": 0,
                    "deploymentsObserved": 0,
                    "deploymentsNotObserved": 0,
                    "versionsObserved": 0,
                    "versionsNotObserved": 0,
                    "metadataReconciliationsDue": 0,
                },
                plan["observationStats"],
            )


if __name__ == "__main__":
    unittest.main()

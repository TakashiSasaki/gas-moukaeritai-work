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

from automation.shared.project_registry import load_metadata


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
    "partial_observation_planner_test",
    "automation/stage-2-inspection/plan-materialization.py",
)
stage3 = load_module(
    "partial_observation_stage3_test",
    "automation/stage-3-materialization/materialize.py",
)


class FakeInspectionApi:
    def __init__(self):
        self.calls: list[str] = []

    def get_project(self, script_id, token):
        self.calls.append("project")
        return {"scriptId": script_id, "updateTime": "same", "title": "fresh"}

    def get_project_files_metadata(self, script_id, token):
        self.calls.append("files")
        return [{"name": "Code", "type": "SERVER_JS"}]

    def list_deployments(self, script_id, token):
        self.calls.append("deployments")
        return [{"deploymentId": "deployment-1"}]

    def list_versions(self, script_id, token):
        self.calls.append("versions")
        return [{"versionNumber": 1}]


class FakeClasp:
    def __init__(self):
        self.calls: list[Path] = []

    def pull(self, project_dir: Path):
        self.calls.append(Path(project_dir))
        raise AssertionError("clasp pull must not run")


def write_project(root: Path, script_id: str, metadata: dict) -> Path:
    project = root / "projects" / script_id
    project.mkdir(parents=True)
    (project / ".clasp.json").write_text(
        json.dumps({"scriptId": script_id}), encoding="utf-8"
    )
    (project / "metadata.json").write_text(json.dumps(metadata), encoding="utf-8")
    return project


def plan_item(
    script_id: str,
    *,
    required: bool,
    checkpoint: str,
    observed: str,
    observation: dict,
) -> dict:
    return {
        "scriptId": script_id,
        "path": f"projects/{script_id}",
        "lifecycle": "present",
        "observation": observation,
        "materialization": {
            "required": required,
            "reason": "test",
            "checkpointAppsScriptUpdateTime": checkpoint,
            "observedAppsScriptUpdateTime": observed,
        },
    }


def plan(item: dict) -> dict:
    return {
        "schemaVersion": 1,
        "materializationRequired": item["materialization"]["required"],
        "projects": [item],
    }


class PartialObservationSemanticsTests(unittest.TestCase):
    def test_stage2_marks_all_currently_fetched_families_observed(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(
                root,
                "script-1",
                {
                    "lifecycle": {"driveInventory": "present"},
                    "syncState": {"lastMaterializedAppsScriptUpdateTime": "same"},
                },
            )
            api = FakeInspectionApi()
            built = planner.build_plan(root, "token", api=api)
            observation = built["projects"][0]["observation"]
            self.assertEqual(
                {
                    "files": "observed",
                    "deployments": "observed",
                    "versions": "observed",
                },
                observation["observationState"],
            )
            self.assertEqual(
                ["project", "files", "deployments", "versions"], api.calls
            )

    def test_not_observed_families_preserve_canonical_metadata(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = write_project(
                root,
                "script-1",
                {
                    "lifecycle": {"driveInventory": "present"},
                    "syncState": {"lastMaterializedAppsScriptUpdateTime": "same"},
                    "appsScriptApi": {"scriptId": "script-1", "updateTime": "same", "title": "old"},
                    "files": [{"name": "Old", "type": "SERVER_JS"}],
                    "deployments": [{"deploymentId": "old-deployment"}],
                    "versions": [{"versionNumber": 7}],
                    "custom": {"preserve": True},
                },
            )
            observation = {
                "appsScriptApi": {
                    "scriptId": "script-1",
                    "updateTime": "same",
                    "title": "fresh",
                },
                "observationState": {
                    "files": "not-observed",
                    "deployments": "observed",
                    "versions": "not-observed",
                },
                "deployments": [{"deploymentId": "fresh-deployment"}],
            }
            clasp = FakeClasp()
            result = stage3.materialize_plan(
                plan(
                    plan_item(
                        "script-1",
                        required=False,
                        checkpoint="same",
                        observed="same",
                        observation=observation,
                    )
                ),
                root,
                clasp=clasp,
            )
            self.assertTrue(result["allProjectsSuccessful"])
            self.assertEqual([], clasp.calls)
            metadata = load_metadata(project)
            self.assertEqual("fresh", metadata["appsScriptApi"]["title"])
            self.assertEqual(
                [{"name": "Old", "type": "SERVER_JS"}], metadata["files"]
            )
            self.assertEqual(
                [{"deploymentId": "fresh-deployment"}], metadata["deployments"]
            )
            self.assertEqual([{"versionNumber": 7}], metadata["versions"])
            self.assertEqual({"preserve": True}, metadata["custom"])
            self.assertEqual(
                "same",
                metadata["syncState"]["lastMaterializedAppsScriptUpdateTime"],
            )

    def test_not_observed_family_must_not_carry_stale_payload(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = write_project(
                root,
                "script-1",
                {
                    "lifecycle": {"driveInventory": "present"},
                    "syncState": {"lastMaterializedAppsScriptUpdateTime": "same"},
                },
            )
            before = load_metadata(project)
            observation = {
                "appsScriptApi": {"scriptId": "script-1", "updateTime": "same"},
                "observationState": {
                    "files": "not-observed",
                    "deployments": "observed",
                    "versions": "observed",
                },
                "files": [],
                "deployments": [],
                "versions": [],
            }
            with self.assertRaisesRegex(
                stage3.MaterializationPlanError,
                "not-observed files must omit",
            ):
                stage3.materialize_plan(
                    plan(
                        plan_item(
                            "script-1",
                            required=False,
                            checkpoint="same",
                            observed="same",
                            observation=observation,
                        )
                    ),
                    root,
                    clasp=FakeClasp(),
                )
            self.assertEqual(before, load_metadata(project))

    def test_required_materialization_requires_observed_files(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(
                root,
                "script-1",
                {
                    "lifecycle": {"driveInventory": "present"},
                    "syncState": {"lastMaterializedAppsScriptUpdateTime": "old"},
                },
            )
            observation = {
                "appsScriptApi": {"scriptId": "script-1", "updateTime": "new"},
                "observationState": {
                    "files": "not-observed",
                    "deployments": "observed",
                    "versions": "observed",
                },
                "deployments": [],
                "versions": [],
            }
            clasp = FakeClasp()
            with self.assertRaisesRegex(
                stage3.MaterializationPlanError,
                "required materialization needs an observed files family",
            ):
                stage3.materialize_plan(
                    plan(
                        plan_item(
                            "script-1",
                            required=True,
                            checkpoint="old",
                            observed="new",
                            observation=observation,
                        )
                    ),
                    root,
                    clasp=clasp,
                )
            self.assertEqual([], clasp.calls)

    def test_explicit_observation_state_must_cover_all_families(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(
                root,
                "script-1",
                {
                    "lifecycle": {"driveInventory": "present"},
                    "syncState": {"lastMaterializedAppsScriptUpdateTime": "same"},
                },
            )
            observation = {
                "appsScriptApi": {"scriptId": "script-1", "updateTime": "same"},
                "observationState": {
                    "files": "observed",
                    "deployments": "observed",
                },
                "files": [],
                "deployments": [],
            }
            with self.assertRaisesRegex(
                stage3.MaterializationPlanError,
                "must declare exactly",
            ):
                stage3.materialize_plan(
                    plan(
                        plan_item(
                            "script-1",
                            required=False,
                            checkpoint="same",
                            observed="same",
                            observation=observation,
                        )
                    ),
                    root,
                    clasp=FakeClasp(),
                )


if __name__ == "__main__":
    unittest.main()

from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from datetime import datetime, timezone
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
    "reconciliation_checkpoint_recovery_planner_test",
    "automation/stage-2-inspection/plan-materialization.py",
)
runner = load_module(
    "reconciliation_checkpoint_recovery_stage3_test",
    "automation/stage-3-materialization/run-materialization.py",
)

NOW = datetime(2026, 9, 7, 0, 0, tzinfo=timezone.utc)
EXPECTED = "2026-09-07T00:00:00Z"


class FakeInspectionApi:
    def get_project(self, script_id, token):
        return {"scriptId": script_id, "updateTime": "same"}

    def get_project_files_metadata(self, script_id, token):
        raise AssertionError("reusable source metadata should stay on the fast path")

    def list_deployments(self, script_id, token):
        return [{"deploymentId": "fresh"}]

    def list_versions(self, script_id, token):
        return [{"versionNumber": 2}]


class NoPullClasp:
    def pull(self, project_dir: Path):
        raise AssertionError("clasp pull must not run")


def write_project(root: Path, reconciliation_state) -> Path:
    project = root / "projects" / "script-1"
    project.mkdir(parents=True)
    (project / ".clasp.json").write_text(
        json.dumps({"scriptId": "script-1"}), encoding="utf-8"
    )
    metadata = {
        "lifecycle": {"driveInventory": "present"},
        "syncState": {"lastMaterializedAppsScriptUpdateTime": "same"},
        "files": [{"name": "Canonical", "type": "SERVER_JS"}],
        "deployments": [{"deploymentId": "old"}],
        "versions": [{"versionNumber": 1}],
        "reconciliationState": reconciliation_state,
    }
    (project / "metadata.json").write_text(json.dumps(metadata), encoding="utf-8")
    return project


class ReconciliationCheckpointRecoveryTests(unittest.TestCase):
    def test_malformed_canonical_checkpoint_states_are_reconciled_and_healed(self):
        malformed_values = (
            {"lastDeploymentVersionReconciliationAt": ""},
            {"lastDeploymentVersionReconciliationAt": 123},
            ["not-an-object"],
        )
        for malformed in malformed_values:
            with self.subTest(malformed=malformed), tempfile.TemporaryDirectory() as temporary:
                root = Path(temporary)
                project = write_project(root, malformed)

                plan = planner.build_plan(root, "token", api=FakeInspectionApi(), now=NOW)
                item = plan["projects"][0]
                self.assertTrue(item["metadataReconciliation"]["due"])
                self.assertIsNone(item["metadataReconciliation"]["checkpointAt"])

                result = runner.materialize_plan(plan, root, clasp=NoPullClasp())

                self.assertTrue(result["allProjectsSuccessful"])
                finalized = load_metadata(project)
                self.assertEqual(
                    EXPECTED,
                    finalized["reconciliationState"][
                        "lastDeploymentVersionReconciliationAt"
                    ],
                )
                self.assertEqual(
                    [{"deploymentId": "fresh"}], finalized["deployments"]
                )
                self.assertEqual([{"versionNumber": 2}], finalized["versions"])

    def test_valid_namespace_siblings_survive_checkpoint_recovery(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = write_project(
                root,
                {
                    "lastDeploymentVersionReconciliationAt": "",
                    "futureSibling": {"preserve": True},
                },
            )
            plan = planner.build_plan(root, "token", api=FakeInspectionApi(), now=NOW)

            result = runner.materialize_plan(plan, root, clasp=NoPullClasp())

            self.assertTrue(result["allProjectsSuccessful"])
            state = load_metadata(project)["reconciliationState"]
            self.assertEqual(EXPECTED, state["lastDeploymentVersionReconciliationAt"])
            self.assertEqual({"preserve": True}, state["futureSibling"])


if __name__ == "__main__":
    unittest.main()

from __future__ import annotations

import copy
import importlib.util
import json
import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import ModuleType

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from automation.shared.project_registry import load_metadata, write_metadata


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
    "daily_metadata_reconciliation_planner_test",
    "automation/stage-2-inspection/plan-materialization.py",
)
runner = load_module(
    "daily_metadata_reconciliation_stage3_test",
    "automation/stage-3-materialization/run-materialization.py",
)

NOW = datetime(2026, 9, 7, 0, 0, tzinfo=timezone.utc)


class FakeInspectionApi:
    def __init__(
        self,
        *,
        project_update_time: str | None = "same",
        fail_on: str | None = None,
    ):
        self.project_update_time = project_update_time
        self.fail_on = fail_on
        self.calls: list[str] = []

    def get_project(self, script_id, token):
        self.calls.append("project")
        payload = {"scriptId": script_id}
        if self.project_update_time is not None:
            payload["updateTime"] = self.project_update_time
        return payload

    def get_project_files_metadata(self, script_id, token):
        self.calls.append("files")
        if self.fail_on == "files":
            raise planner.apps_script_api.AppsScriptApiError("files failed")
        return [{"name": "Remote", "type": "SERVER_JS"}]

    def list_deployments(self, script_id, token):
        self.calls.append("deployments")
        if self.fail_on == "deployments":
            raise planner.apps_script_api.AppsScriptApiError("deployments failed")
        return [{"deploymentId": "fresh-deployment"}]

    def list_versions(self, script_id, token):
        self.calls.append("versions")
        if self.fail_on == "versions":
            raise planner.apps_script_api.AppsScriptApiError("versions failed")
        return [{"versionNumber": 2}]


class NoPullClasp:
    def pull(self, project_dir: Path):
        raise AssertionError("clasp pull must not run")


def timestamp(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def metadata(
    *,
    source_checkpoint: str = "same",
    reconciliation_checkpoint: str | None = None,
    lifecycle: str = "present",
) -> dict:
    result = {
        "lifecycle": {"driveInventory": lifecycle},
        "syncState": {"lastMaterializedAppsScriptUpdateTime": source_checkpoint},
        "files": [{"name": "Canonical", "type": "SERVER_JS"}],
        "deployments": [{"deploymentId": "old-deployment"}],
        "versions": [{"versionNumber": 1}],
    }
    if reconciliation_checkpoint is not None:
        result["reconciliationState"] = {
            "lastDeploymentVersionReconciliationAt": reconciliation_checkpoint
        }
    return result


def write_project(root: Path, value: dict) -> Path:
    project = root / "projects" / "script-1"
    project.mkdir(parents=True)
    (project / ".clasp.json").write_text(
        json.dumps({"scriptId": "script-1"}), encoding="utf-8"
    )
    (project / "metadata.json").write_text(json.dumps(value), encoding="utf-8")
    return project


class DailyMetadataReconciliationTests(unittest.TestCase):
    def test_missing_checkpoint_reconciles_both_families(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(root, metadata())
            api = FakeInspectionApi()

            plan = planner.build_plan(root, "token", api=api, now=NOW)
            item = plan["projects"][0]
            observation = item["observation"]

            self.assertEqual(["project", "deployments", "versions"], api.calls)
            self.assertEqual("observed", observation["observationState"]["deployments"])
            self.assertEqual("observed", observation["observationState"]["versions"])
            self.assertTrue(item["metadataReconciliation"]["due"])
            self.assertEqual(timestamp(NOW), item["metadataReconciliation"]["observedAt"])
            self.assertEqual(1, plan["observationStats"]["metadataReconciliationsDue"])

    def test_checkpoint_age_23h59m_skips_both_families(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            checkpoint = timestamp(NOW - timedelta(hours=23, minutes=59))
            write_project(root, metadata(reconciliation_checkpoint=checkpoint))
            api = FakeInspectionApi()

            item = planner.build_plan(root, "token", api=api, now=NOW)["projects"][0]
            observation = item["observation"]

            self.assertEqual(["project"], api.calls)
            self.assertEqual("not-observed", observation["observationState"]["deployments"])
            self.assertEqual("not-observed", observation["observationState"]["versions"])
            self.assertNotIn("deployments", observation)
            self.assertNotIn("versions", observation)
            self.assertFalse(item["metadataReconciliation"]["due"])
            self.assertIsNone(item["metadataReconciliation"]["observedAt"])

    def test_checkpoint_age_exactly_24h_is_due(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(
                root,
                metadata(reconciliation_checkpoint=timestamp(NOW - timedelta(hours=24))),
            )
            api = FakeInspectionApi()

            item = planner.build_plan(root, "token", api=api, now=NOW)["projects"][0]

            self.assertTrue(item["metadataReconciliation"]["due"])
            self.assertEqual(["project", "deployments", "versions"], api.calls)

    def test_checkpoint_age_over_24h_is_due(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(
                root,
                metadata(reconciliation_checkpoint=timestamp(NOW - timedelta(hours=25))),
            )
            api = FakeInspectionApi()

            item = planner.build_plan(root, "token", api=api, now=NOW)["projects"][0]

            self.assertTrue(item["metadataReconciliation"]["due"])
            self.assertEqual(["project", "deployments", "versions"], api.calls)

    def test_source_unchanged_and_reconciliation_not_due_uses_projects_get_only(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(
                root,
                metadata(reconciliation_checkpoint=timestamp(NOW - timedelta(hours=3))),
            )
            api = FakeInspectionApi(project_update_time="same")

            plan = planner.build_plan(root, "token", api=api, now=NOW)
            observation = plan["projects"][0]["observation"]

            self.assertEqual(["project"], api.calls)
            self.assertEqual(
                {
                    "files": "not-observed",
                    "deployments": "not-observed",
                    "versions": "not-observed",
                },
                observation["observationState"],
            )
            self.assertEqual(1, plan["observationStats"]["deploymentsNotObserved"])
            self.assertEqual(1, plan["observationStats"]["versionsNotObserved"])
            self.assertEqual(0, plan["observationStats"]["metadataReconciliationsDue"])

    def test_source_changed_and_reconciliation_not_due_observes_files_only(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(
                root,
                metadata(
                    source_checkpoint="old",
                    reconciliation_checkpoint=timestamp(NOW - timedelta(hours=3)),
                ),
            )
            api = FakeInspectionApi(project_update_time="new")

            item = planner.build_plan(root, "token", api=api, now=NOW)["projects"][0]
            observation = item["observation"]

            self.assertTrue(item["materialization"]["required"])
            self.assertEqual(["project", "files"], api.calls)
            self.assertEqual("observed", observation["observationState"]["files"])
            self.assertEqual("not-observed", observation["observationState"]["deployments"])
            self.assertEqual("not-observed", observation["observationState"]["versions"])

    def test_source_unchanged_and_reconciliation_due_observes_metadata_only(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(
                root,
                metadata(reconciliation_checkpoint=timestamp(NOW - timedelta(hours=24))),
            )
            api = FakeInspectionApi(project_update_time="same")

            item = planner.build_plan(root, "token", api=api, now=NOW)["projects"][0]
            observation = item["observation"]

            self.assertFalse(item["materialization"]["required"])
            self.assertEqual(["project", "deployments", "versions"], api.calls)
            self.assertEqual("not-observed", observation["observationState"]["files"])
            self.assertEqual("observed", observation["observationState"]["deployments"])
            self.assertEqual("observed", observation["observationState"]["versions"])

    def test_deployments_failure_fails_closed_without_checkpoint_advance(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = write_project(root, metadata())
            before = load_metadata(project)
            api = FakeInspectionApi(fail_on="deployments")

            with self.assertRaises(planner.apps_script_api.AppsScriptApiError):
                planner.build_plan(root, "token", api=api, now=NOW)

            self.assertEqual(["project", "deployments"], api.calls)
            self.assertEqual(before, load_metadata(project))

    def test_versions_failure_fails_closed_without_checkpoint_advance(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = write_project(root, metadata())
            before = load_metadata(project)
            api = FakeInspectionApi(fail_on="versions")

            with self.assertRaises(planner.apps_script_api.AppsScriptApiError):
                planner.build_plan(root, "token", api=api, now=NOW)

            self.assertEqual(["project", "deployments", "versions"], api.calls)
            self.assertEqual(before, load_metadata(project))

    def test_stage3_success_advances_only_reconciliation_checkpoint(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            old_reconciliation = timestamp(NOW - timedelta(hours=24))
            project = write_project(
                root,
                metadata(reconciliation_checkpoint=old_reconciliation),
            )
            api = FakeInspectionApi()
            plan = planner.build_plan(root, "token", api=api, now=NOW)

            result = runner.materialize_plan(plan, root, clasp=NoPullClasp())

            self.assertTrue(result["allProjectsSuccessful"])
            finalized = load_metadata(project)
            self.assertEqual(
                timestamp(NOW),
                finalized["reconciliationState"]["lastDeploymentVersionReconciliationAt"],
            )
            self.assertEqual(
                "same",
                finalized["syncState"]["lastMaterializedAppsScriptUpdateTime"],
            )
            self.assertEqual(
                [{"deploymentId": "fresh-deployment"}], finalized["deployments"]
            )
            self.assertEqual([{"versionNumber": 2}], finalized["versions"])

    def test_stage3_failure_does_not_advance_reconciliation_checkpoint(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            old_reconciliation = timestamp(NOW - timedelta(hours=24))
            project = write_project(
                root,
                metadata(reconciliation_checkpoint=old_reconciliation),
            )
            before = load_metadata(project)
            plan = planner.build_plan(root, "token", api=FakeInspectionApi(), now=NOW)

            def failing_writer(project_dir, value):
                raise RuntimeError("injected metadata write failure")

            result = runner.materialize_plan(
                plan,
                root,
                clasp=NoPullClasp(),
                metadata_writer=failing_writer,
            )

            self.assertFalse(result["allProjectsSuccessful"])
            self.assertEqual(before, load_metadata(project))

    def test_not_observed_deployments_and_versions_are_preserved(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            checkpoint = timestamp(NOW - timedelta(hours=3))
            project = write_project(
                root,
                metadata(reconciliation_checkpoint=checkpoint),
            )
            plan = planner.build_plan(root, "token", api=FakeInspectionApi(), now=NOW)

            result = runner.materialize_plan(plan, root, clasp=NoPullClasp())

            self.assertTrue(result["allProjectsSuccessful"])
            finalized = load_metadata(project)
            self.assertEqual(
                [{"deploymentId": "old-deployment"}], finalized["deployments"]
            )
            self.assertEqual([{"versionNumber": 1}], finalized["versions"])
            self.assertEqual(
                checkpoint,
                finalized["reconciliationState"]["lastDeploymentVersionReconciliationAt"],
            )

    def test_drive_absent_project_performs_no_apps_script_observation(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(root, metadata(lifecycle="absent"))
            api = FakeInspectionApi()

            plan = planner.build_plan(root, "token", api=api, now=NOW)

            self.assertEqual([], api.calls)
            self.assertIsNone(plan["projects"][0]["observation"])
            self.assertFalse(plan["projects"][0]["metadataReconciliation"]["due"])

    def test_injected_clock_is_deterministic_and_naive_time_is_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(
                root,
                metadata(reconciliation_checkpoint=timestamp(NOW - timedelta(hours=24))),
            )
            first = planner.build_plan(root, "token", api=FakeInspectionApi(), now=NOW)
            second = planner.build_plan(root, "token", api=FakeInspectionApi(), now=NOW)
            self.assertEqual(first, second)

            with self.assertRaisesRegex(ValueError, "timezone-aware"):
                planner.build_plan(
                    root,
                    "token",
                    api=FakeInspectionApi(),
                    now=datetime(2026, 9, 7, 0, 0),
                )

    def test_stage3_rejects_stale_reconciliation_checkpoint(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            old_checkpoint = timestamp(NOW - timedelta(hours=24))
            project = write_project(
                root,
                metadata(reconciliation_checkpoint=old_checkpoint),
            )
            plan = planner.build_plan(root, "token", api=FakeInspectionApi(), now=NOW)
            changed = load_metadata(project)
            changed["reconciliationState"]["lastDeploymentVersionReconciliationAt"] = timestamp(
                NOW - timedelta(hours=1)
            )
            write_metadata(project, changed)
            before = copy.deepcopy(load_metadata(project))

            result = runner.materialize_plan(plan, root, clasp=NoPullClasp())

            self.assertFalse(result["allProjectsSuccessful"])
            self.assertEqual(before, load_metadata(project))


if __name__ == "__main__":
    unittest.main()

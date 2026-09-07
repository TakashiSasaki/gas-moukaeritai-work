from __future__ import annotations

import importlib.util
import io
import json
import sys
import tempfile
import unittest
import urllib.parse
from datetime import datetime, timezone
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


api_module = load_module(
    "phase2_inspection_api_test",
    "automation/stage-2-inspection/apps_script_api.py",
)
planner = load_module(
    "phase2_inspection_planner_test",
    "automation/stage-2-inspection/plan-materialization.py",
)


class QueueOpener:
    def __init__(self, payloads):
        self.payloads = list(payloads)
        self.requests = []

    def __call__(self, request):
        self.requests.append(request)
        if not self.payloads:
            raise AssertionError("unexpected API request")
        payload = self.payloads.pop(0)
        if isinstance(payload, Exception):
            raise payload
        return io.StringIO(json.dumps(payload))


class FakeInspectionApi:
    def __init__(self, projects=None, files=None, deployments=None, versions=None):
        self.projects = projects or {}
        self.files = files or {}
        self.deployments = deployments or {}
        self.versions = versions or {}
        self.calls = []

    def get_project(self, script_id, token):
        self.calls.append(("project", script_id, token))
        return dict(self.projects.get(script_id, {"scriptId": script_id, "updateTime": "remote"}))

    def get_project_files_metadata(self, script_id, token):
        self.calls.append(("files", script_id, token))
        return [dict(item) for item in self.files.get(script_id, [])]

    def list_deployments(self, script_id, token):
        self.calls.append(("deployments", script_id, token))
        return [dict(item) for item in self.deployments.get(script_id, [])]

    def list_versions(self, script_id, token):
        self.calls.append(("versions", script_id, token))
        return [dict(item) for item in self.versions.get(script_id, [])]


def write_project(root: Path, script_id: str, metadata: dict) -> Path:
    directory = root / "projects" / script_id
    directory.mkdir(parents=True)
    (directory / "metadata.json").write_text(json.dumps(metadata), encoding="utf-8")
    return directory


class Stage2InspectionApiTests(unittest.TestCase):
    def test_project_and_content_use_structured_endpoints_and_authorization(self):
        opener = QueueOpener([
            {"scriptId": "script-1", "updateTime": "now"},
            {"files": [{
                "name": "Code",
                "type": "SERVER_JS",
                "source": "secret",
                "functionSet": {"values": []},
                "updateTime": "now",
            }]},
        ])
        project = api_module.get_project("script-1", "token-1", opener=opener)
        files = api_module.get_project_files_metadata("script-1", "token-1", opener=opener)
        self.assertEqual("script-1", project["scriptId"])
        self.assertEqual(
            [{"name": "Code", "type": "SERVER_JS", "updateTime": "now"}],
            files,
        )
        self.assertEqual(
            "https://script.googleapis.com/v1/projects/script-1",
            opener.requests[0].full_url,
        )
        content_url = urllib.parse.urlparse(opener.requests[1].full_url)
        self.assertEqual(
            "https://script.googleapis.com/v1/projects/script-1/content",
            urllib.parse.urlunparse(content_url._replace(query="")),
        )
        fields = urllib.parse.parse_qs(content_url.query).get("fields")
        self.assertEqual([api_module._FILE_METADATA_FIELDS], fields)
        self.assertNotIn("source", fields[0])
        self.assertNotIn("functionSet", fields[0])
        self.assertIn("name", fields[0])
        self.assertIn("type", fields[0])
        self.assertIn("createTime", fields[0])
        self.assertIn("updateTime", fields[0])
        self.assertIn("lastModifyUser", fields[0])
        self.assertEqual("Bearer token-1", opener.requests[0].get_header("Authorization"))

    def test_deployments_and_versions_paginate_as_structured_resources(self):
        deployments_opener = QueueOpener([
            {"deployments": [{"deploymentId": "d1"}], "nextPageToken": "page 2"},
            {"deployments": [{"deploymentId": "d2"}]},
        ])
        self.assertEqual(
            [{"deploymentId": "d1"}, {"deploymentId": "d2"}],
            api_module.list_deployments("script-1", "token", opener=deployments_opener),
        )
        self.assertIn("pageToken=page+2", deployments_opener.requests[1].full_url)

        versions_opener = QueueOpener([
            {"versions": [{"versionNumber": 2}], "nextPageToken": "next"},
            {"versions": [{"versionNumber": 3}]},
        ])
        self.assertEqual(
            [{"versionNumber": 2}, {"versionNumber": 3}],
            api_module.list_versions("script-1", "token", opener=versions_opener),
        )

    def test_required_api_failure_is_fail_closed(self):
        opener = QueueOpener([OSError("offline")])
        with self.assertRaisesRegex(api_module.AppsScriptApiError, "offline"):
            api_module.get_project("script-1", "token", opener=opener)

    def test_repeated_pagination_token_is_rejected(self):
        opener = QueueOpener([
            {"deployments": [], "nextPageToken": "same"},
            {"deployments": [], "nextPageToken": "same"},
        ])
        with self.assertRaisesRegex(api_module.AppsScriptApiError, "repeated pagination token"):
            api_module.list_deployments("script-1", "token", opener=opener)


class Stage2PlanningTests(unittest.TestCase):
    def test_absent_project_is_never_inspected_or_selected(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(root, "absent", {
                "lifecycle": {"driveInventory": "absent"},
                "syncState": {"lastMaterializedAppsScriptUpdateTime": "old"},
            })
            api = FakeInspectionApi()
            plan = planner.build_plan(root, "secret-token", api=api)
            self.assertEqual([], api.calls)
            item = plan["projects"][0]
            self.assertFalse(item["materialization"]["required"])
            self.assertEqual("drive-inventory-absent", item["materialization"]["reason"])
            self.assertIsNone(item["observation"])
            self.assertFalse(plan["materializationRequired"])

    def test_exact_checkpoint_match_is_unchanged_but_different_timestamp_materializes(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(root, "same", {
                "lifecycle": {"driveInventory": "present"},
                "syncState": {"lastMaterializedAppsScriptUpdateTime": "2026-09-03T00:00:00Z"},
            })
            write_project(root, "changed", {
                "lifecycle": {"driveInventory": "present"},
                "syncState": {"lastMaterializedAppsScriptUpdateTime": "2026-09-03T00:00:00Z"},
            })
            api = FakeInspectionApi(projects={
                "same": {"scriptId": "same", "updateTime": "2026-09-03T00:00:00Z"},
                "changed": {"scriptId": "changed", "updateTime": "2026-09-03T00:00:00.000Z"},
            })
            plan = planner.build_plan(root, "secret-token", api=api)
            by_id = {item["scriptId"]: item for item in plan["projects"]}
            self.assertFalse(by_id["same"]["materialization"]["required"])
            self.assertTrue(by_id["changed"]["materialization"]["required"])
            self.assertTrue(plan["materializationRequired"])

    def test_missing_remote_update_time_materializes_fail_safe(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(root, "script-a", {
                "syncState": {"lastMaterializedAppsScriptUpdateTime": "old"},
            })
            api = FakeInspectionApi(projects={"script-a": {"scriptId": "script-a"}})
            item = planner.build_plan(root, "secret-token", api=api)["projects"][0]
            self.assertTrue(item["materialization"]["required"])
            self.assertEqual("remote-update-time-unavailable", item["materialization"]["reason"])

    def test_plan_uses_directory_as_registry_key_and_is_deterministic_without_token(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = write_project(root, "canonical-id", {
                "lifecycle": {"driveInventory": "present"},
            })
            (project / ".clasp.json").write_text(
                json.dumps({"scriptId": "wrong-id"}), encoding="utf-8"
            )
            api = FakeInspectionApi(
                projects={"canonical-id": {"scriptId": "canonical-id", "updateTime": "new"}},
                files={"canonical-id": [
                    {"name": "Zed", "type": "SERVER_JS"},
                    {"name": "Alpha", "type": "HTML"},
                ]},
                deployments={"canonical-id": [
                    {"deploymentId": "z"}, {"deploymentId": "a"},
                ]},
                versions={"canonical-id": [
                    {"versionNumber": 9}, {"versionNumber": 2},
                ]},
            )
            now = datetime(2026, 9, 7, 0, 0, tzinfo=timezone.utc)
            plan = planner.build_plan(root, "secret-token", api=api, now=now)
            item = plan["projects"][0]
            self.assertEqual("canonical-id", item["scriptId"])
            self.assertEqual(["Alpha", "Zed"], [f["name"] for f in item["observation"]["files"]])
            self.assertEqual(["a", "z"], [d["deploymentId"] for d in item["observation"]["deployments"]])
            serialized = json.dumps(plan, sort_keys=True)
            self.assertNotIn("secret-token", serialized)
            self.assertNotIn("wrong-id", serialized)
            self.assertEqual(
                plan,
                planner.build_plan(root, "secret-token", api=api, now=now),
            )

    def test_case_insensitive_remote_filename_conflict_fails_before_materialization(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(root, "script-a", {"lifecycle": {"driveInventory": "present"}})
            api = FakeInspectionApi(files={"script-a": [{"name": "Code"}, {"name": "code"}]})
            with self.assertRaises(planner.CaseInsensitiveNameConflict):
                planner.build_plan(root, "secret-token", api=api)

    def test_new_stage2_has_no_clasp_or_subprocess_dependency(self):
        directory = REPO_ROOT / "automation" / "stage-2-inspection"
        for path in directory.glob("*.py"):
            source = path.read_text(encoding="utf-8")
            self.assertNotIn("clasp_client", source)
            self.assertNotIn("import subprocess", source)


if __name__ == "__main__":
    unittest.main()

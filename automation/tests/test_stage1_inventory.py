from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from datetime import datetime
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


fetcher = load_module("stage1_fetch", "automation/stage-1-inventory/fetch-drive-inventory.py")
reconciler = load_module("stage1_reconcile", "automation/stage-1-inventory/reconcile-project-registry.py")
generator = load_module("stage1_index", "automation/stage-1-inventory/generate-public-project-index.py")
migrator = load_module("legacy_migration", "automation/maintenance/migrate-legacy-project-metadata.py")


class FakeResponse:
    def __init__(self, payload, status_code=200):
        self.payload = payload
        self.status_code = status_code

    def json(self):
        return self.payload


class FakeDriveSession:
    def __init__(self):
        self.calls = []
        self.pages = [
            {"files": [{"id": "one"}], "nextPageToken": "page-2", "incompleteSearch": False},
            {"files": [{"id": "two"}], "incompleteSearch": False},
        ]

    def get(self, url, params, headers):
        self.calls.append(dict(params))
        return FakeResponse(self.pages[len(self.calls) - 1])


class FakeIncompleteDriveSession:
    def __init__(self):
        self.calls = []

    def get(self, url, params, headers):
        self.calls.append(dict(params))
        return FakeResponse({"files": [{"id": "one"}], "incompleteSearch": True})


class Stage1InventoryTests(unittest.TestCase):
    def test_drive_inventory_paginates_and_preserves_envelope(self):
        session = FakeDriveSession()
        result = fetcher.fetch_inventory("token", session=session)
        self.assertEqual({"files": [{"id": "one"}, {"id": "two"}]}, result)
        self.assertNotIn("pageToken", session.calls[0])
        self.assertEqual("page-2", session.calls[1]["pageToken"])
        self.assertEqual(100, session.calls[0]["pageSize"])
        self.assertEqual(
            "incompleteSearch, nextPageToken, files(id, name, createdTime, modifiedTime)",
            session.calls[0]["fields"],
        )

    def test_drive_inventory_rejects_incomplete_search(self):
        session = FakeIncompleteDriveSession()
        self.assertIsNone(fetcher.fetch_inventory("token", session=session))
        self.assertEqual(1, len(session.calls))
        self.assertIn("incompleteSearch", session.calls[0]["fields"])

    def test_snapshot_retention_preserves_legacy_seed(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            (directory / "20260406.json").write_text('{"files": []}', encoding="utf-8")
            for second in range(6):
                fetcher.write_snapshot(
                    {"files": []}, directory,
                    now=datetime(2026, 4, 14, 8, 7, 50 + second),
                )
            timestamped = sorted(
                path.name for path in directory.iterdir()
                if fetcher.SNAPSHOT_PATTERN.fullmatch(path.name)
            )
            self.assertEqual(5, len(timestamped))
            self.assertTrue((directory / "20260406.json").exists())

    def test_reconcile_updates_only_drive_fields_and_does_not_migrate(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = root / "projects" / "script-1"
            project.mkdir(parents=True)
            (project / "metadata.json").write_text(
                json.dumps({
                    "appsScriptApi": {"updateTime": "old"},
                    "deployments.json": [{"legacy": True}],
                    "driveApi": {"id": "script-1", "name": "Old", "extra": "keep"},
                }), encoding="utf-8",
            )
            snapshot = root / "snapshot.json"
            snapshot.write_text(
                json.dumps({"files": [{
                    "id": "script-1", "name": "New",
                    "createdTime": "created", "modifiedTime": "modified",
                }]}), encoding="utf-8",
            )
            self.assertEqual(1, reconciler.reconcile(snapshot, root=root))
            metadata = json.loads((project / "metadata.json").read_text(encoding="utf-8"))
            self.assertEqual("New", metadata["driveApi"]["name"])
            self.assertEqual("keep", metadata["driveApi"]["extra"])
            self.assertEqual({"updateTime": "old"}, metadata["appsScriptApi"])
            self.assertIn("deployments.json", metadata)
            self.assertNotIn("deployments", metadata)
            self.assertFalse((project / ".clasp.json").exists())

    def test_reconcile_new_project_creates_split_layout_clasp(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            snapshot = root / "snapshot.json"
            snapshot.write_text(
                json.dumps({"files": [{"id": "script-1", "name": "New"}]}),
                encoding="utf-8",
            )
            self.assertEqual(1, reconciler.reconcile(snapshot, root=root))
            project = root / "projects" / "script-1"
            clasp = json.loads((project / ".clasp.json").read_text(encoding="utf-8"))
            self.assertEqual({"rootDir": "gas", "scriptId": "script-1"}, clasp)
            self.assertTrue((project / "repository" / "metadata.json").is_file())
            self.assertFalse((project / "metadata.json").exists())

    def test_public_index_preserves_drive_authority_fallback_and_deterministic_sort(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            values = {
                "b": {
                    "driveApi": {
                        "name": "Zulu",
                        "createdTime": "2025-01-01T00:00:00Z",
                        "modifiedTime": "2025-02-01T00:00:00Z",
                    },
                },
                "c": {
                    "driveApi": {
                        "createdTime": "2024-01-01T00:00:00Z",
                        "modifiedTime": "2024-02-01T00:00:00Z",
                    },
                    "appsScriptApi": {"title": "alpha"},
                },
                "a": {
                    "appsScriptApi": {
                        "title": "alpha",
                        "createTime": "must-not-be-published",
                        "updateTime": "must-not-be-published",
                    },
                },
            }
            for script_id, metadata in values.items():
                project = root / "projects" / script_id
                repository = project / "repository"
                repository.mkdir(parents=True)
                (repository / "metadata.json").write_text(
                    json.dumps(metadata), encoding="utf-8"
                )
            (root / "projects" / "a" / "README.md").write_text(
                "# alpha\n", encoding="utf-8"
            )
            self.assertEqual(
                [
                    {
                        "id": "a",
                        "name": "alpha",
                        "createdAt": None,
                        "updatedAt": None,
                        "hasReadme": True,
                    },
                    {
                        "id": "c",
                        "name": "alpha",
                        "createdAt": "2024-01-01T00:00:00Z",
                        "updatedAt": "2024-02-01T00:00:00Z",
                        "hasReadme": False,
                    },
                    {
                        "id": "b",
                        "name": "Zulu",
                        "createdAt": "2025-01-01T00:00:00Z",
                        "updatedAt": "2025-02-01T00:00:00Z",
                        "hasReadme": False,
                    },
                ],
                generator.build_index(root),
            )

    def test_public_index_excludes_drive_absent_projects_in_split_layout(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for script_id, lifecycle in (("present", "present"), ("absent", "absent")):
                repository = root / "projects" / script_id / "repository"
                repository.mkdir(parents=True)
                (repository / "metadata.json").write_text(
                    json.dumps({
                        "driveApi": {"name": script_id.title()},
                        "lifecycle": {"driveInventory": lifecycle},
                    }),
                    encoding="utf-8",
                )
            self.assertEqual(
                ["present"],
                [entry["id"] for entry in generator.build_index(root)],
            )

    def test_current_public_index_membership_is_preserved(self):
        expected = json.loads((REPO_ROOT / "docs" / "projects.json").read_text(encoding="utf-8"))
        expected_membership = sorted((item["id"], item["name"]) for item in expected)
        actual_membership = sorted(
            (item["id"], item["name"]) for item in generator.build_index(REPO_ROOT)
        )
        self.assertEqual(expected_membership, actual_membership)

    def test_legacy_migration_is_explicit_and_dry_run_is_read_only(self):
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary) / "projects" / "script-1"
            project.mkdir(parents=True)
            original = {
                "driveApi": {"id": "script-1"},
                "version": "7",
                "deployments.json": [{"deploymentId": "d1"}],
            }
            metadata_path = project / "metadata.json"
            metadata_path.write_text(json.dumps(original), encoding="utf-8")
            changed, notes = migrator.migrate_project(project, apply=False)
            self.assertTrue(changed)
            self.assertTrue(notes)
            self.assertEqual(original, json.loads(metadata_path.read_text(encoding="utf-8")))
            changed, _ = migrator.migrate_project(project, apply=True)
            self.assertTrue(changed)
            migrated = json.loads(metadata_path.read_text(encoding="utf-8"))
            self.assertEqual("7", migrated["driveApi"]["version"])
            self.assertEqual([{"deploymentId": "d1"}], migrated["deployments"])
            self.assertNotIn("version", migrated)
            self.assertNotIn("deployments.json", migrated)

    def test_legacy_migration_preserves_conflicting_values(self):
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary) / "projects" / "script-1"
            project.mkdir(parents=True)
            metadata_path = project / "metadata.json"
            metadata_path.write_text(json.dumps({
                "driveApi": {"id": "script-1"},
                "deployments": [{"deploymentId": "canonical"}],
                "deployments.json": [{"deploymentId": "legacy"}],
            }), encoding="utf-8")
            changed, notes = migrator.migrate_project(project, apply=True)
            self.assertFalse(changed)
            self.assertTrue(any(note.startswith("conflict:") for note in notes))
            result = json.loads(metadata_path.read_text(encoding="utf-8"))
            self.assertIn("deployments.json", result)
            self.assertEqual([{"deploymentId": "canonical"}], result["deployments"])


if __name__ == "__main__":
    unittest.main()

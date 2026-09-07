from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

from automation.shared import project_registry


RECONCILE_PATH = (
    Path(__file__).resolve().parents[1]
    / "stage-1-inventory"
    / "reconcile-project-registry.py"
)
SPEC = importlib.util.spec_from_file_location("split_layout_reconcile", RECONCILE_PATH)
assert SPEC is not None and SPEC.loader is not None
reconcile_module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(reconcile_module)


class SplitLayoutCutoverTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary_directory.name)
        (self.root / "projects").mkdir()

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def write_snapshot(self, files: list[dict], *, complete: bool = True) -> Path:
        snapshot_dir = self.root / "data" / "inventory" / "drive-api" / "snapshots"
        snapshot_dir.mkdir(parents=True, exist_ok=True)
        snapshot = snapshot_dir / "20260907-120000.json"
        snapshot.write_text(
            json.dumps({"complete": complete, "files": files}),
            encoding="utf-8",
        )
        return snapshot

    def test_new_metadata_defaults_to_repository_directory(self) -> None:
        project_dir = self.root / "projects" / "script-new"
        project_dir.mkdir()

        project_registry.write_metadata(project_dir, {"driveApi": {"name": "New"}})

        self.assertFalse((project_dir / "metadata.json").exists())
        self.assertEqual(
            project_registry.load_metadata(project_dir),
            {"driveApi": {"name": "New"}},
        )
        self.assertTrue((project_dir / "repository" / "metadata.json").is_file())

    def test_stage1_creates_new_project_directly_in_split_layout(self) -> None:
        snapshot = self.write_snapshot(
            [
                {
                    "id": "script-new",
                    "name": "New Project",
                    "createdTime": "2026-09-07T00:00:00.000Z",
                    "modifiedTime": "2026-09-07T01:00:00.000Z",
                }
            ]
        )

        self.assertEqual(reconcile_module.reconcile(snapshot, self.root), 1)

        project_dir = self.root / "projects" / "script-new"
        clasp = json.loads((project_dir / ".clasp.json").read_text(encoding="utf-8"))
        metadata = json.loads(
            (project_dir / "repository" / "metadata.json").read_text(encoding="utf-8")
        )
        self.assertEqual(clasp, {"rootDir": "gas", "scriptId": "script-new"})
        self.assertEqual(metadata["driveApi"]["id"], "script-new")
        self.assertEqual(metadata["driveApi"]["name"], "New Project")
        self.assertEqual(metadata["lifecycle"]["driveInventory"], "present")
        self.assertFalse((project_dir / "metadata.json").exists())
        self.assertFalse((project_dir / "gas").exists())

    def test_existing_legacy_project_remains_legacy_before_bulk_migration(self) -> None:
        project_dir = self.root / "projects" / "script-existing"
        project_dir.mkdir()
        (project_dir / ".clasp.json").write_text(
            json.dumps({"scriptId": "script-existing"}),
            encoding="utf-8",
        )
        (project_dir / "metadata.json").write_text(
            json.dumps({"driveApi": {"id": "script-existing", "name": "Before"}}),
            encoding="utf-8",
        )
        snapshot = self.write_snapshot(
            [{"id": "script-existing", "name": "After"}],
        )

        self.assertEqual(reconcile_module.reconcile(snapshot, self.root), 1)

        self.assertTrue((project_dir / "metadata.json").is_file())
        self.assertFalse((project_dir / "repository" / "metadata.json").exists())
        metadata = json.loads((project_dir / "metadata.json").read_text(encoding="utf-8"))
        clasp = json.loads((project_dir / ".clasp.json").read_text(encoding="utf-8"))
        self.assertEqual(metadata["driveApi"]["name"], "After")
        self.assertEqual(clasp, {"scriptId": "script-existing"})


if __name__ == "__main__":
    unittest.main()

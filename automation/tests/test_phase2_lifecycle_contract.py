from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
from types import ModuleType

REPO_ROOT = Path(__file__).resolve().parents[2]


def load_script(name: str, relative_path: str) -> ModuleType:
    path = REPO_ROOT / relative_path
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


reconcile_module = load_script(
    "phase2_test_reconcile",
    "automation/stage-1-inventory/reconcile-project-registry.py",
)
index_module = load_script(
    "phase2_test_index",
    "automation/stage-1-inventory/generate-public-project-index.py",
)


def write_project(root: Path, script_id: str, metadata: dict) -> Path:
    directory = root / "projects" / script_id
    source_dir = directory / "gas"
    repository_dir = directory / "repository"
    source_dir.mkdir(parents=True)
    repository_dir.mkdir()
    (directory / ".clasp.json").write_text(
        json.dumps({"scriptId": script_id, "rootDir": "gas"}), encoding="utf-8"
    )
    (repository_dir / "metadata.json").write_text(
        json.dumps(metadata), encoding="utf-8"
    )
    return directory


def read_metadata(project: Path) -> dict:
    return json.loads(
        (project / "repository" / "metadata.json").read_text(encoding="utf-8")
    )


def write_snapshot(
    root: Path,
    files: list[dict],
    name: str = "20260903-000000.json",
    *,
    complete: bool = True,
) -> Path:
    directory = root / "data" / "inventory" / "drive-api" / "snapshots"
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / name
    payload = {"files": files}
    if complete:
        payload["complete"] = True
    path.write_text(json.dumps(payload), encoding="utf-8")
    return path


class Phase2LifecycleContractTests(unittest.TestCase):
    def test_disappeared_project_is_marked_absent_without_source_deletion_and_can_reappear(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = write_project(
                root,
                "script-a",
                {"driveApi": {"id": "script-a", "name": "Alpha"}},
            )
            source = project / "gas" / "Code.js"
            source.write_text("function alpha() {}\n", encoding="utf-8")

            empty_snapshot = write_snapshot(root, [])
            reconcile_module.reconcile(empty_snapshot, root)
            metadata = read_metadata(project)
            self.assertEqual(metadata["lifecycle"]["driveInventory"], "absent")
            self.assertTrue(source.exists())

            present_snapshot = write_snapshot(
                root,
                [{"id": "script-a", "name": "Alpha", "modifiedTime": "2026-09-03T02:00:00Z"}],
                "20260903-010000.json",
            )
            reconcile_module.reconcile(present_snapshot, root)
            metadata = read_metadata(project)
            self.assertEqual(metadata["lifecycle"]["driveInventory"], "present")
            self.assertTrue(source.exists())

    def test_incomplete_snapshot_never_marks_omitted_project_absent(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = write_project(
                root,
                "script-a",
                {
                    "driveApi": {"id": "script-a", "name": "Alpha"},
                    "lifecycle": {"driveInventory": "present"},
                },
            )
            incomplete = write_snapshot(root, [], complete=False)
            reconcile_module.reconcile(incomplete, root)
            metadata = read_metadata(project)
            self.assertEqual(metadata["lifecycle"]["driveInventory"], "present")

    def test_incomplete_snapshot_can_still_confirm_presence(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = write_project(
                root,
                "script-a",
                {
                    "driveApi": {"id": "script-a", "name": "Old"},
                    "lifecycle": {"driveInventory": "absent"},
                },
            )
            incomplete = write_snapshot(
                root,
                [{"id": "script-a", "name": "Alpha"}],
                complete=False,
            )
            reconcile_module.reconcile(incomplete, root)
            metadata = read_metadata(project)
            self.assertEqual(metadata["lifecycle"]["driveInventory"], "present")
            self.assertEqual(metadata["driveApi"]["name"], "Alpha")

    def test_public_index_excludes_absent_projects(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            write_project(
                root,
                "active",
                {
                    "driveApi": {"id": "active", "name": "Active"},
                    "lifecycle": {"driveInventory": "present"},
                },
            )
            write_project(
                root,
                "absent",
                {
                    "driveApi": {"id": "absent", "name": "Absent"},
                    "lifecycle": {"driveInventory": "absent"},
                },
            )
            self.assertEqual(
                index_module.build_index(root),
                [{
                    "id": "active",
                    "name": "Active",
                    "createdAt": None,
                    "updatedAt": None,
                    "hasReadme": False,
                }],
            )


if __name__ == "__main__":
    unittest.main()

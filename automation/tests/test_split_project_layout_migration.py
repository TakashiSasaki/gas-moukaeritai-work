from __future__ import annotations

import importlib.util
import io
import json
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from types import ModuleType


REPO_ROOT = Path(__file__).resolve().parents[2]


def load_module(name: str, relative_path: str) -> ModuleType:
    path = REPO_ROOT / relative_path
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load module: {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


layout_migration = load_module(
    "test_split_project_layout_migration_module",
    "automation/maintenance/migrate-project-layout.py",
)


class SplitProjectLayoutMigrationTests(unittest.TestCase):
    def make_root(self) -> tuple[tempfile.TemporaryDirectory, Path]:
        temporary = tempfile.TemporaryDirectory()
        root = Path(temporary.name)
        (root / "projects").mkdir()
        return temporary, root

    def make_legacy_project(self, root: Path, script_id: str = "script-1") -> Path:
        project = root / "projects" / script_id
        project.mkdir(parents=True)
        (project / ".clasp.json").write_text(
            json.dumps({"scriptId": script_id}), encoding="utf-8"
        )
        (project / "metadata.json").write_text(
            json.dumps({"driveApi": {"id": script_id, "name": "Legacy"}}),
            encoding="utf-8",
        )
        (project / "Code.js").write_text("function main() {}\n", encoding="utf-8")
        (project / "index.html").write_text("<p>hello</p>\n", encoding="utf-8")
        (project / "appsscript.json").write_text("{}\n", encoding="utf-8")
        (project / "README.md").write_text("# Legacy\n", encoding="utf-8")
        return project

    def test_layout_migration_dry_run_is_read_only_and_apply_converges(self) -> None:
        temporary, root = self.make_root()
        try:
            project = self.make_legacy_project(root)
            original = {
                path.name: path.read_bytes()
                for path in project.iterdir()
                if path.is_file()
            }
            plan = layout_migration.plan_project(project)
            self.assertTrue(plan["changed"])
            self.assertEqual(
                plan["sourceFiles"],
                ["Code.js", "appsscript.json", "index.html"],
            )
            self.assertEqual(plan["repositoryEntries"], [])
            for name, content in original.items():
                self.assertEqual((project / name).read_bytes(), content)

            applied = layout_migration.apply_project(project)
            self.assertTrue(applied["changed"])
            self.assertFalse((project / "metadata.json").exists())
            self.assertTrue((project / "repository" / "metadata.json").is_file())
            for name in ("Code.js", "appsscript.json", "index.html"):
                self.assertFalse((project / name).exists())
                self.assertEqual((project / "gas" / name).read_bytes(), original[name])
            self.assertEqual((project / "README.md").read_bytes(), original["README.md"])
            clasp = json.loads((project / ".clasp.json").read_text(encoding="utf-8"))
            self.assertEqual(clasp["scriptId"], "script-1")
            self.assertEqual(clasp["rootDir"], "gas")
            self.assertFalse(layout_migration.plan_project(project)["changed"])
        finally:
            temporary.cleanup()

    def test_layout_migration_moves_non_gas_assets_under_repository(self) -> None:
        temporary, root = self.make_root()
        try:
            project = self.make_legacy_project(root)
            (project / "image.png").write_bytes(b"png-bytes")
            (project / "notes.txt").write_text("supplemental", encoding="utf-8")
            assets = project / "assets"
            assets.mkdir()
            (assets / "icon.ico").write_bytes(b"ico-bytes")

            plan = layout_migration.plan_project(project)
            self.assertEqual(
                plan["repositoryEntries"],
                ["assets", "image.png", "notes.txt"],
            )
            layout_migration.apply_project(project)
            self.assertEqual(
                (project / "repository" / "image.png").read_bytes(),
                b"png-bytes",
            )
            self.assertEqual(
                (project / "repository" / "notes.txt").read_text(encoding="utf-8"),
                "supplemental",
            )
            self.assertEqual(
                (project / "repository" / "assets" / "icon.ico").read_bytes(),
                b"ico-bytes",
            )
        finally:
            temporary.cleanup()

    def test_layout_migration_consolidates_legacy_standalone_metadata(self) -> None:
        temporary, root = self.make_root()
        try:
            project = self.make_legacy_project(root)
            deployments = [{"deploymentId": "deployment-1"}]
            (project / "deployments.json").write_text(
                json.dumps(deployments), encoding="utf-8"
            )
            layout_migration.apply_project(project)
            metadata = json.loads(
                (project / "repository" / "metadata.json").read_text(encoding="utf-8")
            )
            self.assertEqual(metadata["deployments"], deployments)
            self.assertFalse((project / "deployments.json").exists())
        finally:
            temporary.cleanup()

    def test_layout_migration_rejects_repository_destination_conflict(self) -> None:
        temporary, root = self.make_root()
        try:
            project = self.make_legacy_project(root)
            (project / "image.png").write_bytes(b"root")
            repository = project / "repository"
            repository.mkdir()
            (repository / "image.png").write_bytes(b"existing")
            with self.assertRaises(layout_migration.LayoutMigrationError):
                layout_migration.plan_project(project)
        finally:
            temporary.cleanup()

    def test_current_repository_flat_layout_is_fully_classifiable(self) -> None:
        # Pre-bulk-migration safety gate: every tracked project must be
        # classifiable using the GAS flat-file contract without path ambiguity.
        with redirect_stdout(io.StringIO()):
            affected = layout_migration.run(REPO_ROOT, apply=False)
        self.assertGreater(affected, 0)


if __name__ == "__main__":
    unittest.main()

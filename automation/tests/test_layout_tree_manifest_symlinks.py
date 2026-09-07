from __future__ import annotations

import importlib.util
import os
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
EMITTER_PATH = REPO_ROOT / "automation" / "maintenance" / "emit-layout-tree-manifest.py"
SPEC = importlib.util.spec_from_file_location("layout_tree_manifest", EMITTER_PATH)
assert SPEC is not None and SPEC.loader is not None
emitter = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(emitter)


@unittest.skipIf(os.name == "nt", "symlink creation may require Windows developer privileges")
class LayoutTreeManifestSymlinkTests(unittest.TestCase):
    def with_root(self, root: Path):
        class RootContext:
            def __enter__(inner_self):
                inner_self.original = emitter.REPO_ROOT
                emitter.REPO_ROOT = root
                return inner_self

            def __exit__(inner_self, exc_type, exc, tb):
                emitter.REPO_ROOT = inner_self.original

        return RootContext()

    def test_working_files_rejects_symlinked_leaf(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            projects = root / "projects"
            gas = projects / "script" / "gas"
            gas.mkdir(parents=True)
            outside = root / "outside.js"
            outside.write_text("outside", encoding="utf-8")
            (gas / "Code.js").symlink_to(outside)

            with self.with_root(root):
                with self.assertRaisesRegex(RuntimeError, "contains a symlink"):
                    emitter._working_files(projects)

    def test_working_files_rejects_broken_top_level_symlink(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            projects = root / "projects"
            projects.mkdir()
            (projects / "broken").symlink_to(root / "missing")

            with self.with_root(root):
                with self.assertRaisesRegex(RuntimeError, "contains a symlink"):
                    emitter._working_files(projects)

    def test_working_files_rejects_symlinked_directory(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            projects = root / "projects"
            project = projects / "script"
            project.mkdir(parents=True)
            outside = root / "outside"
            outside.mkdir()
            (project / "gas").symlink_to(outside, target_is_directory=True)

            with self.with_root(root):
                with self.assertRaisesRegex(RuntimeError, "contains a symlink"):
                    emitter._working_files(projects)

    def test_head_entries_rejects_git_symlink_mode(self) -> None:
        original_git = emitter._git
        emitter._git = lambda *args: "120000 blob deadbeef\tprojects/script/gas/Code.js\n"
        try:
            with self.assertRaisesRegex(RuntimeError, "symlink in HEAD"):
                emitter.head_entries()
        finally:
            emitter._git = original_git


if __name__ == "__main__":
    unittest.main()

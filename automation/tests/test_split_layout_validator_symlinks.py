from __future__ import annotations

import importlib.util
import os
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
VALIDATOR_PATH = REPO_ROOT / ".github" / "scripts" / "validate-automation.py"
SPEC = importlib.util.spec_from_file_location("split_layout_validator", VALIDATOR_PATH)
assert SPEC is not None and SPEC.loader is not None
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)


@unittest.skipIf(os.name == "nt", "symlink creation may require Windows developer privileges")
class SplitLayoutValidatorSymlinkTests(unittest.TestCase):
    def test_project_symlink_scan_rejects_nested_leaf_without_following_it(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = root / "project"
            gas = project / "gas"
            gas.mkdir(parents=True)
            outside = root / "outside.js"
            outside.write_text("outside", encoding="utf-8")
            link = gas / "Code.js"
            link.symlink_to(outside)

            self.assertEqual(validator._project_symlinks(project), (link,))

    def test_project_symlink_scan_rejects_nested_directory_without_following_it(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            project = root / "project"
            repository = project / "repository"
            repository.mkdir(parents=True)
            outside = root / "outside"
            outside.mkdir()
            (outside / "metadata.json").write_text("{}", encoding="utf-8")
            link = repository / "linked"
            link.symlink_to(outside, target_is_directory=True)

            self.assertEqual(validator._project_symlinks(project), (link,))

    def test_file_walk_skips_symlinked_json_leaf(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            repository = root / "repository"
            repository.mkdir()
            canonical = repository / "metadata.json"
            canonical.write_text("{}", encoding="utf-8")
            outside = root / "outside.json"
            outside.write_text("{}", encoding="utf-8")
            link = repository / "linked.json"
            link.symlink_to(outside)

            discovered = validator._iter_files_without_following_symlinks(
                root, suffix=".json"
            )
            self.assertEqual(set(discovered), {canonical, outside})
            self.assertNotIn(link, discovered)


if __name__ == "__main__":
    unittest.main()

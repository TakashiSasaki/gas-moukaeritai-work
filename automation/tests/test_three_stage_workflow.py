from __future__ import annotations

import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
STAGE1 = REPO_ROOT / ".github" / "workflows" / "stage-1-inventory.yml"
STAGE23 = REPO_ROOT / ".github" / "workflows" / "stage-2-3-sync.yml"
LEGACY_WORKFLOW = REPO_ROOT / ".github" / "workflows" / "stage-2-sync.yml"


def step_block(workflow: str, name: str) -> str:
    marker = f"      - name: {name}\n"
    start = workflow.index(marker)
    next_step = workflow.find("\n      - name: ", start + len(marker))
    return workflow[start:] if next_step == -1 else workflow[start:next_step]


class ThreeStageWorkflowTests(unittest.TestCase):
    def test_compatibility_workflow_is_replaced(self):
        self.assertTrue(STAGE23.is_file())
        self.assertFalse(LEGACY_WORKFLOW.exists())

        workflow = STAGE23.read_text(encoding="utf-8")
        self.assertNotIn("automation/stage-2-sync/", workflow)
        self.assertNotIn("clasp list", workflow)

    def test_stage2_plan_flows_directly_into_stage3(self):
        workflow = STAGE23.read_text(encoding="utf-8")
        stage2 = "automation/stage-2-inspection/plan-materialization.py"
        stage3 = "automation/stage-3-materialization/run-materialization.py"
        self.assertIn(stage2, workflow)
        self.assertIn(stage3, workflow)
        self.assertLess(workflow.index(stage2), workflow.index(stage3))
        self.assertIn('--plan "$RUNNER_TEMP/stage-2-plan.json"', workflow)

    def test_plan_is_checked_before_conditional_clasp_setup(self):
        workflow = STAGE23.read_text(encoding="utf-8")
        inspection = step_block(workflow, "Inspect Apps Script state and build materialization plan")
        self.assertIn('materialization.get("required")', inspection)
        self.assertIn(
            'plan.get("materializationRequired") is not required',
            inspection,
        )
        self.assertIn("does not match project decisions", inspection)

    def test_clasp_setup_is_conditional_but_stage3_is_not(self):
        workflow = STAGE23.read_text(encoding="utf-8")
        condition = "if: steps.inspection.outputs.materialization_required == 'true'"
        self.assertIn(
            condition,
            step_block(workflow, "Set up Node.js for source materialization"),
        )
        self.assertIn(
            condition,
            step_block(workflow, "Install clasp for source materialization"),
        )
        self.assertNotIn(
            "if:",
            step_block(workflow, "Materialize sources and finalize observations"),
        )

    def test_credentials_use_step_environment_not_shell_literal(self):
        for workflow_path in (STAGE1, STAGE23):
            workflow = workflow_path.read_text(encoding="utf-8")
            restore = step_block(workflow, "Restore Google credentials")
            self.assertIn(
                "CLASPRC_JSON: ${{ secrets.CLASPRC_JSON }}",
                restore,
            )
            self.assertIn("printf '%s' \"$CLASPRC_JSON\"", restore)
            self.assertNotIn(
                "printf '%s' '${{ secrets.CLASPRC_JSON }}'",
                restore,
            )

    def test_project_state_writers_are_serialized(self):
        stage1 = STAGE1.read_text(encoding="utf-8")
        stage23 = STAGE23.read_text(encoding="utf-8")
        group = "group: gas-project-state-writer"
        self.assertIn(group, stage1)
        self.assertIn(group, stage23)
        self.assertIn("cancel-in-progress: false", stage1)
        self.assertIn("cancel-in-progress: false", stage23)

    def test_stage23_commits_only_canonical_project_state(self):
        workflow = STAGE23.read_text(encoding="utf-8")
        commit = step_block(workflow, "Commit and push synchronized project state")
        self.assertIn("git add projects/", commit)
        self.assertNotIn("git add .", commit)
        self.assertNotIn("git add docs", commit)
        self.assertNotIn("git add data", commit)

    def test_validation_occurs_before_commit(self):
        workflow = STAGE23.read_text(encoding="utf-8")
        validation = "python .github/scripts/validate-automation.py"
        commit = "- name: Commit and push synchronized project state"
        self.assertIn(validation, workflow)
        self.assertLess(workflow.index(validation), workflow.index(commit))


if __name__ == "__main__":
    unittest.main()

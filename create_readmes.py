
import os
import sys
from pathlib import Path
import difflib

def create_readme_for_project(project_id, root_dir):
    docs_md_path = Path(root_dir) / "docs" / f"{project_id}.md"
    project_readme_path = Path(root_dir) / project_id / "README.md"

    if not docs_md_path.exists():
        print(f"Warning: {docs_md_path} does not exist. Skipping project {project_id}.")
        return

    with open(docs_md_path, 'r', encoding='utf-8') as f:
        docs_content = f.read()

    if project_readme_path.exists():
        with open(project_readme_path, 'r', encoding='utf-8') as f:
            existing_content = f.read()

        if existing_content.strip() == docs_content.strip():
            print(f"Info: {project_readme_path} already exists and is identical. Skipping.")
            return

        print(f"Conflict: {project_readme_path} already exists with different content.")
        print("--- Existing content ---")
        print(existing_content)
        print("--- New content from docs ---")
        print(docs_content)
        print("--- Diff ---")
        diff = difflib.unified_diff(
            existing_content.splitlines(keepends=True),
            docs_content.splitlines(keepends=True),
            fromfile=str(project_readme_path),
            tofile=str(docs_md_path)
        )
        sys.stdout.writelines(diff)
        
        response = input(f"Overwrite {project_readme_path} with content from {docs_md_path}? (y/n): ")
        if response.lower() != 'y':
            print(f"Skipping overwrite for {project_id}.")
            return

    with open(project_readme_path, 'w', encoding='utf-8') as f:
        f.write(docs_content)
    print(f"Successfully created/updated {project_readme_path}")

def main():
    root_dir = os.getcwd()
    projects_without_readme_path = Path("/home/codespace/.gemini/tmp/4ede9f523cac3dfa6ca71c2776c98d830a4c367ac77f6e7e76a2432c8f236536/projects_without_readme.txt")

    if not projects_without_readme_path.exists():
        print(f"Error: {projects_without_readme_path} not found.")
        sys.exit(1)

    with open(projects_without_readme_path, 'r', encoding='utf-8') as f:
        project_ids = [line.strip() for line in f if line.strip()]

    for project_id in project_ids:
        create_readme_for_project(project_id, root_dir)

if __name__ == "__main__":
    main()

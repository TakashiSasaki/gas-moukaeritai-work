#!/usr/bin/env python3
"""Emit GitHub Git Tree API elements for the applied project-layout migration.

This helper is intentionally read-only with respect to Git. Run
``migrate-project-layout.py --apply`` in a disposable checkout first. The
helper then compares the working `projects/` tree with `HEAD`, reuses existing
Git blob SHAs for byte-identical moved files, and embeds UTF-8 content only for
newly modified text files such as `.clasp.json` and consolidated metadata.

The remote repository is never mutated by this script.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]


def _git(*args: str) -> str:
    completed = subprocess.run(
        ["git", *args],
        cwd=REPO_ROOT,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    return completed.stdout


def head_entries() -> dict[str, tuple[str, str, str]]:
    entries: dict[str, tuple[str, str, str]] = {}
    output = _git(
        "-c",
        "core.quotePath=false",
        "ls-tree",
        "-r",
        "--full-tree",
        "HEAD",
        "projects",
    )
    for line in output.splitlines():
        metadata, path = line.split("\t", 1)
        mode, object_type, sha = metadata.split(" ", 2)
        if object_type != "blob":
            continue
        entries[path] = (mode, object_type, sha)
    return entries


def _blob_sha(path: Path) -> str:
    # `git hash-object` without `-w` computes the canonical blob id but does
    # not write anything into the local object database.
    return _git("hash-object", str(path.relative_to(REPO_ROOT))).strip()


def working_entries(
    originals: dict[str, tuple[str, str, str]],
) -> dict[str, tuple[str, str]]:
    original_modes_by_sha: dict[str, str] = {}
    for mode, _, sha in originals.values():
        original_modes_by_sha.setdefault(sha, mode)

    entries: dict[str, tuple[str, str]] = {}
    projects = REPO_ROOT / "projects"
    for path in sorted(candidate for candidate in projects.rglob("*") if candidate.is_file()):
        relative = path.relative_to(REPO_ROOT).as_posix()
        sha = _blob_sha(path)
        if relative in originals:
            mode = originals[relative][0]
        else:
            mode = original_modes_by_sha.get(sha, "100644")
        entries[relative] = (mode, sha)
    return entries


def build_elements() -> list[dict[str, Any]]:
    originals = head_entries()
    working = working_entries(originals)
    original_shas = {sha for _, _, sha in originals.values()}
    elements: list[dict[str, Any]] = []

    for path in sorted(set(originals) - set(working)):
        mode, object_type, _ = originals[path]
        elements.append({"path": path, "mode": mode, "type": object_type, "sha": None})

    for path in sorted(working):
        mode, sha = working[path]
        original = originals.get(path)
        if original is not None and original[2] == sha:
            continue
        element: dict[str, Any] = {"path": path, "mode": mode, "type": "blob"}
        if sha in original_shas:
            element["sha"] = sha
        else:
            source = REPO_ROOT / path
            try:
                element["content"] = source.read_text(encoding="utf-8")
            except UnicodeError as exc:
                raise RuntimeError(
                    f"new/modified binary blob has no reusable HEAD SHA: {path} ({sha})"
                ) from exc
        elements.append(element)

    return sorted(elements, key=lambda item: (item["path"], item.get("sha") is not None))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--chunk", type=int, required=True)
    parser.add_argument("--chunks", type=int, required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.chunks <= 0 or not 0 <= args.chunk < args.chunks:
        raise SystemExit("invalid chunk selection")
    elements = build_elements()
    width = (len(elements) + args.chunks - 1) // args.chunks
    start = args.chunk * width
    selected = elements[start : start + width]
    digest = hashlib.sha256(
        json.dumps(elements, ensure_ascii=False, sort_keys=True).encode("utf-8")
    ).hexdigest()
    print(
        "TREE_MANIFEST "
        + json.dumps(
            {
                "chunk": args.chunk,
                "chunks": args.chunks,
                "total": len(elements),
                "digest": digest,
                "elements": selected,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

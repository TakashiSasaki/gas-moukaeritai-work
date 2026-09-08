# タイトル文字列の適切さ判定

## Overview

This Google Apps Script project classifies file/document titles as appropriate or inappropriate using a three-stage pipeline. Cheap deterministic rules run first; only titles that survive those checks need an optional Gemini/LLM judgment.

## Three-stage judgment pipeline

`judgeTitle(title, useLLM, modelName)` evaluates a title in order:

1. **Fast rules** — dictionary/exact-pattern checks catch known bad or generic names such as `README.md`, `無題のドキュメント`, and log-like filenames.
2. **Regular-expression rules** — detect structural patterns such as bare URLs, generated/copy-style names, date-only names, question/prompt-like text, and other low-quality title forms.
3. **LLM judgment** — optional Gemini-based classification for ambiguous titles that were not rejected by the deterministic rules.

The result records the original title, `isBad`, a textual type/reason, and the stage that produced the decision.

## Gemini setup

Set `GEMINI_API_KEY` in Script Properties to enable stage 3. Without an API key, the deterministic stages can still be exercised and the comprehensive test skips LLM calls.

The source contains a `runComprehensiveTest()` function with representative good and bad titles. LLM calls are deliberately spaced with `Utilities.sleep(1000)` to reduce API-rate pressure.

## Other components

- `judge_fast_rules.js` — stage 1 dictionary/fast rules.
- `judge_regex_rules.js` — stage 2 regular-expression rules.
- `judge_llm_titles.js` — stage 3 model-based judgment.
- `judge_titles_main.js` — orchestration and comprehensive tests.
- `doGet.js` / `index.html` — Web App interface.
- `deployment_utils.js` — deployment-related helpers.

The staged design is intentional: deterministic judgments are faster, cheaper, and reproducible, while the LLM is reserved for titles that need semantic interpretation.
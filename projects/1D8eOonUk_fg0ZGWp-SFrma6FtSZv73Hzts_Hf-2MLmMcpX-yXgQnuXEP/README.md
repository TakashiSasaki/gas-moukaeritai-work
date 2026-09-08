# Ehime Matsuyama Museum Street

## Overview

This Google Apps Script Web App generates and serves up-to-date exhibition/event summary pages for museums and cultural facilities in Matsuyama and Ehime. It uses the Gemini API with Google Search grounding to gather information from configured official sources, generates static HTML reports, and stores report history in a Google Spreadsheet.

## Covered facilities

The current configuration defines ten facilities, including Ehime Prefectural Museum of Art, Bansuiso, Saka no Ue no Kumo Museum, Shiki Memorial Museum, Yuzuki Castle Ruins, Miurart Village, Seki Museum, Akiyama Brothers Birthplace, Matsuyama Castle Ninomaru Historical Garden, and Ehime University Museum.

Each facility has a set of source URLs and facility-specific instructions in `gas/Config.js`.

## How it works

1. `buildPrompt(pageId)` creates a facility-specific request from the configured source URLs.
2. `generateFacilityHtml()` calls Gemini with Google Search grounding and asks for factual, responsive, static HTML containing current/future events.
3. `saveHtmlData()` appends the generated HTML to the `Facility_HTML_Data_Store` spreadsheet.
4. `getLatestHtml()` returns the latest saved page and caches it for five minutes.
5. `doGet(e)` serves the application index or an individual facility report. A report can also be returned as `text/plain` with the `mime=text/plain` query parameter.

## Configuration

Set `GEMINI_API_KEY` in Script Properties. The selected model is also stored in Script Properties; the current source allows `gemini-3.1-flash-lite-preview` and `gemini-3.1-pro-preview` and defaults to the former.

## Storage and concurrency

Generated HTML is persisted to a spreadsheet rather than fetched dynamically on every page request. Script locks protect writes, and Script Cache reduces repeated spreadsheet reads. The spreadsheet ID is maintained in Script Properties and recreated automatically if the previous store is unavailable.

The generated reports depend on external source availability and model output, so the source links embedded in each report remain important for verification.
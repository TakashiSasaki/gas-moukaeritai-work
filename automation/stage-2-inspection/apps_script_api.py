#!/usr/bin/env python3
"""Fail-closed structured Apps Script API I/O for Stage 2 inspection."""

from __future__ import annotations

import email.utils
import json
import logging
import random
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from typing import Any, Callable

API_ROOT = "https://script.googleapis.com/v1/projects"
_EXCLUDED_FILE_FIELDS = {"source", "functionSet"}
_FILE_METADATA_FIELDS = (
    "files(name,type,lastModifyUser(domain,email,name,photoUrl),createTime,updateTime)"
)
_RETRYABLE_HTTP_STATUS_CODES = frozenset({429, 500, 502, 503, 504})
_MAX_ATTEMPTS = 5
_BASE_BACKOFF_SECONDS = 1.0
_MAX_RETRY_DELAY_SECONDS = 30.0
_MIN_RETRY_DELAY_SECONDS = 0.1
_JITTER_RATIO = 0.25
_LOGGER = logging.getLogger(__name__)


class AppsScriptApiError(RuntimeError):
    """Raised when a required Apps Script API observation cannot be obtained."""


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _bounded_delay(seconds: float) -> float:
    return min(_MAX_RETRY_DELAY_SECONDS, max(_MIN_RETRY_DELAY_SECONDS, seconds))


def _retry_after_delay(
    value: str | None,
    *,
    now: Callable[[], datetime],
) -> float | None:
    if value is None:
        return None
    value = value.strip()
    if not value:
        return None

    if value.isascii() and value.isdigit():
        try:
            seconds = int(value)
        except ValueError:
            return None
        if seconds >= _MAX_RETRY_DELAY_SECONDS:
            return _MAX_RETRY_DELAY_SECONDS
        return _bounded_delay(float(seconds))

    try:
        retry_at = email.utils.parsedate_to_datetime(value)
    except (TypeError, ValueError, OverflowError):
        return None
    if retry_at is None:
        return None
    if retry_at.tzinfo is None:
        retry_at = retry_at.replace(tzinfo=timezone.utc)

    current = now()
    if current.tzinfo is None:
        current = current.replace(tzinfo=timezone.utc)
    seconds = (
        retry_at.astimezone(timezone.utc) - current.astimezone(timezone.utc)
    ).total_seconds()
    return _bounded_delay(seconds)


def _local_backoff_delay(
    failed_attempt: int,
    *,
    random_source: Callable[[], float],
) -> float:
    exponential = min(
        _BASE_BACKOFF_SECONDS * (2 ** max(0, failed_attempt - 1)),
        _MAX_RETRY_DELAY_SECONDS,
    )
    jitter_sample = min(1.0, max(0.0, float(random_source())))
    delay = exponential + (exponential * _JITTER_RATIO * jitter_sample)
    return _bounded_delay(delay)


def _http_error_message(url: str, exc: urllib.error.HTTPError, *, exhausted: bool) -> str:
    reason = f" {exc.reason}" if exc.reason else ""
    if exhausted:
        return (
            f"Apps Script API request failed for {url} after {_MAX_ATTEMPTS} attempts: "
            f"HTTP {exc.code}{reason}"
        )
    return f"Apps Script API request failed for {url}: HTTP {exc.code}{reason}"


def _request_json(
    url: str,
    access_token: str,
    *,
    opener: Callable[..., Any] = urllib.request.urlopen,
    sleep: Callable[[float], None] | None = None,
    random_source: Callable[[], float] | None = None,
    now: Callable[[], datetime] | None = None,
) -> dict[str, Any]:
    request = urllib.request.Request(url)
    request.add_header("Authorization", f"Bearer {access_token}")
    sleeper = sleep if sleep is not None else time.sleep
    jitter_source = random_source if random_source is not None else random.random
    clock = now if now is not None else _utc_now

    for attempt in range(1, _MAX_ATTEMPTS + 1):
        try:
            with opener(request) as response:
                payload = json.load(response)
        except urllib.error.HTTPError as exc:
            retryable = exc.code in _RETRYABLE_HTTP_STATUS_CODES
            exhausted = retryable and attempt >= _MAX_ATTEMPTS
            if not retryable or exhausted:
                raise AppsScriptApiError(
                    _http_error_message(url, exc, exhausted=exhausted)
                ) from exc

            retry_after = _retry_after_delay(
                exc.headers.get("Retry-After") if exc.headers is not None else None,
                now=clock,
            )
            if retry_after is not None:
                delay = retry_after
                delay_source = "Retry-After"
            else:
                delay = _local_backoff_delay(attempt, random_source=jitter_source)
                delay_source = "local exponential backoff with jitter"

            _LOGGER.warning(
                "Apps Script API transient request failure for %s: HTTP %d on attempt %d/%d; "
                "retrying attempt %d/%d in %.2fs (%s)",
                url,
                exc.code,
                attempt,
                _MAX_ATTEMPTS,
                attempt + 1,
                _MAX_ATTEMPTS,
                delay,
                delay_source,
            )
            sleeper(delay)
            continue
        except Exception as exc:
            raise AppsScriptApiError(f"Apps Script API request failed for {url}: {exc}") from exc

        if not isinstance(payload, dict):
            raise AppsScriptApiError(f"Apps Script API response must be an object: {url}")
        return payload

    raise AssertionError("bounded Apps Script API retry loop exited unexpectedly")


def _object_list(payload: dict[str, Any], field: str, url: str) -> list[dict[str, Any]]:
    values = payload.get(field, [])
    if not isinstance(values, list):
        raise AppsScriptApiError(f"Apps Script API response field {field!r} must be a list: {url}")
    if any(not isinstance(item, dict) for item in values):
        raise AppsScriptApiError(
            f"Apps Script API response field {field!r} contains a non-object resource: {url}"
        )
    return values


def _paged_resources(
    base_url: str,
    access_token: str,
    field: str,
    *,
    opener: Callable[..., Any] = urllib.request.urlopen,
) -> list[dict[str, Any]]:
    resources: list[dict[str, Any]] = []
    page_token: str | None = None
    seen_tokens: set[str] = set()
    while True:
        url = base_url
        if page_token:
            url += "?" + urllib.parse.urlencode({"pageToken": page_token})
        payload = _request_json(url, access_token, opener=opener)
        resources.extend(_object_list(payload, field, url))
        next_token = payload.get("nextPageToken")
        if next_token is None:
            break
        if not isinstance(next_token, str) or not next_token:
            raise AppsScriptApiError(f"Apps Script API nextPageToken must be a non-empty string: {url}")
        if next_token in seen_tokens:
            raise AppsScriptApiError(f"Apps Script API repeated pagination token for {base_url}")
        seen_tokens.add(next_token)
        page_token = next_token
    return resources


def get_project(
    script_id: str,
    access_token: str,
    *,
    opener: Callable[..., Any] = urllib.request.urlopen,
) -> dict[str, Any]:
    return _request_json(f"{API_ROOT}/{script_id}", access_token, opener=opener)


def get_project_files_metadata(
    script_id: str,
    access_token: str,
    *,
    opener: Callable[..., Any] = urllib.request.urlopen,
) -> list[dict[str, Any]]:
    query = urllib.parse.urlencode({"fields": _FILE_METADATA_FIELDS})
    url = f"{API_ROOT}/{script_id}/content?{query}"
    payload = _request_json(url, access_token, opener=opener)
    files = _object_list(payload, "files", url)
    # Keep the defensive filter so tests/custom openers and future server changes
    # cannot accidentally place source bodies or function metadata in the plan.
    return [
        {key: value for key, value in item.items() if key not in _EXCLUDED_FILE_FIELDS}
        for item in files
    ]


def list_deployments(
    script_id: str,
    access_token: str,
    *,
    opener: Callable[..., Any] = urllib.request.urlopen,
) -> list[dict[str, Any]]:
    return _paged_resources(
        f"{API_ROOT}/{script_id}/deployments",
        access_token,
        "deployments",
        opener=opener,
    )


def list_versions(
    script_id: str,
    access_token: str,
    *,
    opener: Callable[..., Any] = urllib.request.urlopen,
) -> list[dict[str, Any]]:
    return _paged_resources(
        f"{API_ROOT}/{script_id}/versions",
        access_token,
        "versions",
        opener=opener,
    )

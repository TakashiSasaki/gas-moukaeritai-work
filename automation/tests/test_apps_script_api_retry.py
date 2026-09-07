from __future__ import annotations

import email.message
import email.utils
import importlib.util
import io
import json
import sys
import unittest
import urllib.error
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest import mock

REPO_ROOT = Path(__file__).resolve().parents[2]


def load_module():
    path = REPO_ROOT / "automation" / "stage-2-inspection" / "apps_script_api.py"
    spec = importlib.util.spec_from_file_location("stage2_inspection_retry_api", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


api = load_module()


class SequenceOpener:
    def __init__(self, outcomes):
        self.outcomes = list(outcomes)
        self.urls: list[str] = []
        self.requests = []

    def __call__(self, request):
        self.urls.append(request.full_url)
        self.requests.append(request)
        if not self.outcomes:
            raise AssertionError("opener called more times than expected")
        outcome = self.outcomes.pop(0)
        if isinstance(outcome, BaseException):
            raise outcome
        return io.StringIO(json.dumps(outcome))


def http_error(url: str, status: int, *, retry_after: str | None = None):
    headers = email.message.Message()
    if retry_after is not None:
        headers["Retry-After"] = retry_after
    return urllib.error.HTTPError(url, status, "test failure", headers, io.BytesIO(b""))


class AppsScriptApiRetryTests(unittest.TestCase):
    def test_429_retries_then_succeeds(self):
        url = f"{api.API_ROOT}/script/content"
        opener = SequenceOpener([http_error(url, 429), {"files": []}])
        sleeps: list[float] = []

        with self.assertLogs(api._LOGGER, level="WARNING") as logs:
            payload = api._request_json(
                url,
                "secret-token",
                opener=opener,
                sleep=sleeps.append,
                random_source=lambda: 0.0,
            )

        self.assertEqual({"files": []}, payload)
        self.assertEqual(2, len(opener.requests))
        self.assertEqual([1.0], sleeps)
        self.assertIn("HTTP 429", "\n".join(logs.output))
        self.assertIn("local exponential backoff with jitter", "\n".join(logs.output))
        self.assertNotIn("secret-token", "\n".join(logs.output))

    def test_503_retries_then_succeeds(self):
        url = f"{api.API_ROOT}/script"
        opener = SequenceOpener([http_error(url, 503), {"scriptId": "script"}])
        sleeps: list[float] = []

        payload = api._request_json(
            url,
            "token",
            opener=opener,
            sleep=sleeps.append,
            random_source=lambda: 0.5,
        )

        self.assertEqual("script", payload["scriptId"])
        self.assertEqual(2, len(opener.requests))
        self.assertGreater(sleeps[0], api._BASE_BACKOFF_SECONDS)
        self.assertLessEqual(sleeps[0], api._MAX_RETRY_DELAY_SECONDS)

    def test_retry_exhaustion_is_finite_and_fail_closed(self):
        url = f"{api.API_ROOT}/script"
        opener = SequenceOpener(
            [http_error(url, 500) for _ in range(api._MAX_ATTEMPTS)]
        )
        sleeps: list[float] = []

        with self.assertRaisesRegex(
            api.AppsScriptApiError,
            rf"after {api._MAX_ATTEMPTS} attempts: HTTP 500",
        ):
            api._request_json(
                url,
                "token",
                opener=opener,
                sleep=sleeps.append,
                random_source=lambda: 0.0,
            )

        self.assertEqual(api._MAX_ATTEMPTS, len(opener.requests))
        self.assertEqual(api._MAX_ATTEMPTS - 1, len(sleeps))
        self.assertTrue(
            all(
                api._MIN_RETRY_DELAY_SECONDS <= delay <= api._MAX_RETRY_DELAY_SECONDS
                for delay in sleeps
            )
        )

    def test_non_retryable_http_error_fails_without_retry(self):
        for status in (400, 401, 403, 404):
            with self.subTest(status=status):
                url = f"{api.API_ROOT}/script"
                opener = SequenceOpener([http_error(url, status)])
                sleeps: list[float] = []

                with self.assertRaisesRegex(api.AppsScriptApiError, rf"HTTP {status}"):
                    api._request_json(
                        url,
                        "token",
                        opener=opener,
                        sleep=sleeps.append,
                        random_source=lambda: 0.0,
                    )

                self.assertEqual(1, len(opener.requests))
                self.assertEqual([], sleeps)

    def test_retry_after_delta_seconds_controls_delay(self):
        url = f"{api.API_ROOT}/script"
        opener = SequenceOpener(
            [http_error(url, 429, retry_after="7"), {"scriptId": "script"}]
        )
        sleeps: list[float] = []

        def unexpected_random():
            raise AssertionError("Retry-After should bypass local jitter")

        with self.assertLogs(api._LOGGER, level="WARNING") as logs:
            api._request_json(
                url,
                "token",
                opener=opener,
                sleep=sleeps.append,
                random_source=unexpected_random,
            )

        self.assertEqual([7.0], sleeps)
        self.assertIn("(Retry-After)", "\n".join(logs.output))

    def test_retry_after_http_date_is_supported(self):
        url = f"{api.API_ROOT}/script"
        current = datetime(2026, 9, 7, 0, 0, 0, tzinfo=timezone.utc)
        retry_at = email.utils.format_datetime(
            current + timedelta(seconds=9), usegmt=True
        )
        opener = SequenceOpener(
            [http_error(url, 503, retry_after=retry_at), {"scriptId": "script"}]
        )
        sleeps: list[float] = []

        api._request_json(
            url,
            "token",
            opener=opener,
            sleep=sleeps.append,
            random_source=lambda: 0.0,
            now=lambda: current,
        )

        self.assertEqual([9.0], sleeps)

    def test_malformed_retry_after_falls_back_to_backoff(self):
        url = f"{api.API_ROOT}/script"
        opener = SequenceOpener(
            [http_error(url, 503, retry_after="not-a-valid-value"), {"ok": True}]
        )
        sleeps: list[float] = []

        api._request_json(
            url,
            "token",
            opener=opener,
            sleep=sleeps.append,
            random_source=lambda: 0.0,
        )

        self.assertEqual([1.0], sleeps)

    def test_retry_delays_are_bounded(self):
        url = f"{api.API_ROOT}/script"
        opener = SequenceOpener(
            [http_error(url, 429, retry_after="999999"), {"ok": True}]
        )
        sleeps: list[float] = []

        api._request_json(
            url,
            "token",
            opener=opener,
            sleep=sleeps.append,
            random_source=lambda: 1.0,
        )

        self.assertEqual([api._MAX_RETRY_DELAY_SECONDS], sleeps)
        self.assertEqual(
            api._MAX_RETRY_DELAY_SECONDS,
            api._local_backoff_delay(100, random_source=lambda: 1.0),
        )

    def test_retry_on_later_page_retries_only_that_page(self):
        base_url = f"{api.API_ROOT}/script/deployments"
        second_url = f"{base_url}?pageToken=page-2"
        opener = SequenceOpener(
            [
                {"deployments": [{"deploymentId": "d1"}], "nextPageToken": "page-2"},
                http_error(second_url, 503),
                {"deployments": [{"deploymentId": "d2"}]},
            ]
        )
        sleeps: list[float] = []

        with mock.patch.object(api.time, "sleep", side_effect=sleeps.append), mock.patch.object(
            api.random, "random", return_value=0.0
        ):
            deployments = api.list_deployments("script", "token", opener=opener)

        self.assertEqual(
            [{"deploymentId": "d1"}, {"deploymentId": "d2"}], deployments
        )
        self.assertEqual([base_url, second_url, second_url], opener.urls)
        self.assertEqual([1.0], sleeps)


if __name__ == "__main__":
    unittest.main()

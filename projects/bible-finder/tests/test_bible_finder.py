"""Unit tests for Bible Finder; all ESV API traffic is mocked."""

from __future__ import annotations

import io
import json
import os
import sys
import unittest
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlparse


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import bible_finder as bf  # noqa: E402


class FakeResponse:
    """Minimal context-managed byte response accepted by json.load."""

    def __init__(self, payload: object) -> None:
        self._stream = io.BytesIO(json.dumps(payload).encode("utf-8"))

    def __enter__(self) -> io.BytesIO:
        return self._stream

    def __exit__(self, *_args: object) -> None:
        self._stream.close()


def payload(
    page: int,
    total_pages: int,
    results: list[dict[str, str]],
    *,
    total_results: int | None = None,
) -> dict[str, object]:
    """Build a realistic passage-search response."""

    return {
        "page": page,
        "total_results": len(results) if total_results is None else total_results,
        "total_pages": total_pages,
        "results": results,
    }


class RecordingOpener:
    """Return page-specific payloads while recording encoded requests."""

    def __init__(self, pages: dict[int, object]) -> None:
        self.pages = pages
        self.requests: list[object] = []

    def __call__(self, request: object, *, timeout: float) -> FakeResponse:
        del timeout
        self.requests.append(request)
        page = int(parse_qs(urlparse(request.full_url).query)["page"][0])
        return FakeResponse(self.pages[page])


class StubClient:
    """Search client stub keyed by the exact query sent by SearchService."""

    def __init__(self, responses: dict[str, bf.APISearchResult]) -> None:
        self.responses = responses
        self.queries: list[str] = []

    def search(self, query: str) -> bf.APISearchResult:
        self.queries.append(query)
        return self.responses[query]


def api_result(*verses: tuple[str, str], total: int | None = None) -> bf.APISearchResult:
    """Create a service-level mocked API result."""

    items = tuple(bf.VerseResult(reference, content) for reference, content in verses)
    return bf.APISearchResult(items, len(items) if total is None else total, 1, False)


class ESVClientTests(unittest.TestCase):
    def test_fetches_every_api_page(self) -> None:
        opener = RecordingOpener(
            {
                1: payload(
                    1,
                    2,
                    [{"reference": "John 3:16", "content": "First page."}],
                    total_results=2,
                ),
                2: payload(
                    2,
                    2,
                    [{"reference": "Romans 5:8", "content": "Second page."}],
                    total_results=2,
                ),
            }
        )
        client = bf.ESVClient("test-key", opener=opener, request_interval=0)

        result = client.search("love")

        self.assertEqual([verse.reference for verse in result.results], ["John 3:16", "Romans 5:8"])
        self.assertEqual(len(opener.requests), 2)
        for request in opener.requests:
            params = parse_qs(urlparse(request.full_url).query)
            self.assertEqual(params["q"], ["love"])
            self.assertEqual(params["page-size"], ["100"])
            self.assertEqual(request.get_header("Authorization"), "Token test-key")

    def test_stops_at_licensing_maximum_of_five_pages(self) -> None:
        pages = {
            page_number: payload(
                page_number,
                6,
                [
                    {
                        "reference": f"Psalm {page_number}:{verse_number}",
                        "content": f"Verse {verse_number}",
                    }
                    for verse_number in range(1, 101)
                ],
                total_results=600,
            )
            for page_number in range(1, 6)
        }
        opener = RecordingOpener(pages)
        client = bf.ESVClient("test-key", opener=opener, request_interval=0)

        result = client.search("the")

        self.assertEqual(len(result.results), 500)
        self.assertEqual(len(opener.requests), 5)
        self.assertTrue(result.retrieval_limited)

    def test_empty_api_result(self) -> None:
        opener = RecordingOpener({1: payload(1, 0, [], total_results=0)})
        result = bf.ESVClient("key", opener=opener, request_interval=0).search("xyz")
        self.assertEqual(result.results, ())
        self.assertEqual(result.total_results, 0)
        self.assertFalse(result.retrieval_limited)

    def test_missing_key_has_setup_instructions(self) -> None:
        with self.assertRaises(bf.MissingAPIKeyError) as caught:
            bf.ESVClient.from_environment({})
        message = str(caught.exception)
        self.assertIn("export ESV_API_KEY=\"your-key-here\"", message)
        self.assertIn("python3 bible_finder.py", message)
        self.assertIn(bf.ESV_APPLICATION_URL, message)

    def test_invalid_key_error(self) -> None:
        def unauthorized(_request: object, *, timeout: float) -> object:
            del timeout
            raise HTTPError(bf.API_URL, 401, "Unauthorized", {}, None)

        client = bf.ESVClient("bad-key", opener=unauthorized, request_interval=0)
        with self.assertRaises(bf.AuthenticationError):
            client.search("love")

    def test_rate_limit_error(self) -> None:
        def limited(_request: object, *, timeout: float) -> object:
            del timeout
            raise HTTPError(bf.API_URL, 429, "Limited", {}, None)

        with self.assertRaises(bf.RateLimitError):
            bf.ESVClient("key", opener=limited, request_interval=0).search("peace")

    def test_network_error(self) -> None:
        def offline(_request: object, *, timeout: float) -> object:
            del timeout
            raise URLError("offline")

        with self.assertRaises(bf.NetworkError):
            bf.ESVClient("key", opener=offline, request_interval=0).search("hope")

    def test_malformed_response_error(self) -> None:
        opener = RecordingOpener({1: {"page": 1, "results": "not-a-list"}})
        with self.assertRaises(bf.APIResponseError):
            bf.ESVClient("key", opener=opener, request_interval=0).search("hope")


class SearchServiceTests(unittest.TestCase):
    def test_exact_phrase_is_quoted_for_api(self) -> None:
        stub = StubClient({'"steadfast love"': api_result(("Psalm 136:1", "His steadfast love."))})
        result = bf.SearchService(stub).exact("steadfast love")  # type: ignore[arg-type]
        self.assertEqual(stub.queries, ['"steadfast love"'])
        self.assertEqual(result.terms, ("steadfast love",))

    def test_topic_expansion_and_reference_deduplication(self) -> None:
        responses = {
            "anxious": api_result(("Philippians 4:6", "Do not be anxious.")),
            "worry": api_result(("Matthew 6:25", "Do not be anxious.")),
            "fear": api_result(("Psalm 56:3", "When I am afraid.")),
            "afraid": api_result(
                ("psalm   56:3", "When I am afraid."),
                ("Isaiah 41:10", "Fear not."),
            ),
        }
        result = bf.SearchService(StubClient(responses)).topic("Anxiety")  # type: ignore[arg-type]
        self.assertEqual(result.terms, ("anxious", "worry", "fear", "afraid"))
        self.assertEqual(len(result.results), 4)
        self.assertEqual(result.duplicates_removed, 1)

    def test_unknown_topic_falls_back_to_keyword(self) -> None:
        stub = StubClient({"hospitality": api_result(("Romans 12:13", "Show hospitality."))})
        result = bf.SearchService(stub).topic("hospitality")  # type: ignore[arg-type]
        self.assertEqual(stub.queries, ["hospitality"])
        self.assertEqual(result.mode, "topic fallback (keyword)")

    def test_empty_queries_are_rejected_without_api_call(self) -> None:
        stub = StubClient({})
        service = bf.SearchService(stub)  # type: ignore[arg-type]
        for method in (service.keyword, service.exact, service.topic):
            with self.subTest(method=method.__name__):
                with self.assertRaises(ValueError):
                    method("   ")
        self.assertEqual(stub.queries, [])

    def test_half_book_limit_is_enforced(self) -> None:
        # 2 John is a short-book exception; Ruth is limited to floor(85 / 2).
        ruth = tuple(bf.VerseResult(f"Ruth 1:{number}", "Text") for number in range(1, 45))
        short = (bf.VerseResult("2 John 1:1", "Text"),)
        permitted, limited = bf.apply_licensing_limits(ruth + short)
        self.assertEqual(sum(v.reference.startswith("Ruth") for v in permitted), 42)
        self.assertIn(short[0], permitted)
        self.assertTrue(limited)


class PresentationTests(unittest.TestCase):
    def test_passage_links_are_fully_encoded(self) -> None:
        self.assertEqual(
            bf.passage_url("Song of Solomon 2:4"),
            "https://www.esv.org/Song+of+Solomon+2%3A4/",
        )

    def test_no_color_highlight_preserves_text_exactly(self) -> None:
        scripture = "Peace I leave with you; my peace I give to you."
        self.assertEqual(bf.highlight(scripture, ("peace",), bf.Palette(False)), scripture)

    def test_terminal_displays_complete_result_and_notice(self) -> None:
        output = io.StringIO()
        app = bf.TerminalApp(
            bf.SearchService(StubClient({})),  # type: ignore[arg-type]
            palette=bf.Palette(False),
            output=output,
            input_fn=lambda _prompt: "q",
        )
        search = bf.SearchResults(
            query="love",
            mode="keyword",
            terms=("love",),
            results=(bf.VerseResult("John 3:16", "For God so loved the world."),),
            total_reported=1,
            unique_retrieved=1,
            duplicates_removed=0,
            licensing_limited=False,
        )
        app.display_results(search)
        rendered = output.getvalue()
        self.assertIn("[1] John 3:16 \u2014 ESV", rendered)
        self.assertIn("For God so loved the world.", rendered)
        self.assertIn("https://www.esv.org/John+3%3A16/", rendered)
        self.assertIn("Used by permission. All rights reserved.", rendered)


if __name__ == "__main__":
    unittest.main()

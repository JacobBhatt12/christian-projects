#!/usr/bin/env python3
"""Bible Finder: search the ESV from a peaceful terminal interface.

Verse text is requested from the official ESV API and is never written to disk.
This project intentionally uses only the Python standard library.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import socket
import sys
import textwrap
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Callable, Iterable, Mapping, Sequence, TextIO
from urllib.error import HTTPError, URLError
from urllib.parse import quote_plus, urlencode
from urllib.request import Request, urlopen


API_URL = "https://api.esv.org/v3/passage/search/"
ESV_APPLICATION_URL = "https://api.esv.org/account/create-application/"
API_PAGE_SIZE = 100
MAX_VERSES = 500
DISPLAY_PAGE_SIZE = 10
REQUEST_INTERVAL_SECONDS = 1.05  # The ESV API permits at most 60 requests/minute.

COPYRIGHT_NOTICE = (
    "Scripture quotations marked \u201cESV\u201d are from the ESV\u00ae Bible "
    "(The Holy Bible, English Standard Version\u00ae), \u00a9 2001 by Crossway, "
    "a publishing ministry of Good News Publishers. Used by permission. "
    "All rights reserved. The ESV text may not be quoted in any publication "
    "made available to the public by a Creative Commons license. The ESV "
    "may not be translated into any other language.\n\n"
    "Users may not copy or download more than 500 verses of the ESV Bible "
    "or more than one half of any book of the ESV Bible."
)


# Verse totals are metadata, not bundled Scripture. They let the application
# enforce Crossway's half-of-a-book display limit for search results.
BOOK_VERSE_TOTALS: Mapping[str, int] = {
    "Genesis": 1533, "Exodus": 1213, "Leviticus": 859, "Numbers": 1288,
    "Deuteronomy": 959, "Joshua": 658, "Judges": 618, "Ruth": 85,
    "1 Samuel": 810, "2 Samuel": 695, "1 Kings": 816, "2 Kings": 719,
    "1 Chronicles": 942, "2 Chronicles": 822, "Ezra": 280, "Nehemiah": 406,
    "Esther": 167, "Job": 1070, "Psalm": 2461, "Psalms": 2461,
    "Proverbs": 915, "Ecclesiastes": 222, "Song of Solomon": 117,
    "Isaiah": 1292, "Jeremiah": 1364, "Lamentations": 154, "Ezekiel": 1273,
    "Daniel": 357, "Hosea": 197, "Joel": 73, "Amos": 146, "Obadiah": 21,
    "Jonah": 48, "Micah": 105, "Nahum": 47, "Habakkuk": 56,
    "Zephaniah": 53, "Haggai": 38, "Zechariah": 211, "Malachi": 55,
    "Matthew": 1071, "Mark": 678, "Luke": 1151, "John": 879,
    "Acts": 1007, "Romans": 433, "1 Corinthians": 437,
    "2 Corinthians": 257, "Galatians": 149, "Ephesians": 155,
    "Philippians": 104, "Colossians": 95, "1 Thessalonians": 89,
    "2 Thessalonians": 47, "1 Timothy": 113, "2 Timothy": 83,
    "Titus": 46, "Philemon": 25, "Hebrews": 303, "James": 108,
    "1 Peter": 105, "2 Peter": 61, "1 John": 105, "2 John": 13,
    "3 John": 14, "Jude": 25, "Revelation": 404,
}

# Crossway's API terms except single- and double-chapter books from the
# half-a-book request limit. The overall 500-verse limit still applies.
SHORT_BOOK_EXCEPTIONS = {"Obadiah", "Haggai", "Philemon", "2 John", "3 John", "Jude"}


TOPIC_MAP: Mapping[str, tuple[str, ...]] = {
    "love": ("love", "loved", "lovingkindness", "beloved"),
    "peace": ("peace", "rest", "reconciliation", "still"),
    "anxiety": ("anxious", "worry", "fear", "afraid"),
    "fear": ("fear", "afraid", "dismayed", "terror"),
    "depression and sorrow": ("sorrow", "downcast", "despair", "weeping"),
    "depression": ("sorrow", "downcast", "despair", "weeping"),
    "sorrow": ("sorrow", "downcast", "despair", "weeping"),
    "forgiveness": ("forgive", "forgiven", "forgiveness", "mercy"),
    "faith": ("faith", "believe", "trust", "faithful"),
    "hope": ("hope", "wait", "promise", "steadfast"),
    "grace": ("grace", "favor", "gift", "mercy"),
    "salvation": ("salvation", "saved", "redeem", "deliverance"),
    "prayer": ("pray", "prayer", "ask", "intercede"),
    "wisdom": ("wisdom", "wise", "understanding", "discernment"),
    "strength": ("strength", "strong", "power", "uphold"),
    "courage": ("courage", "courageous", "boldness", "dismayed"),
    "loneliness": ("alone", "forsaken", "desolate", "with you"),
    "grief": ("grief", "mourn", "sorrow", "weeping"),
    "healing": ("heal", "healed", "healing", "restore"),
    "temptation": ("temptation", "tempted", "snare", "resist"),
    "sin": ("sin", "sinned", "transgression", "iniquity"),
    "justice": ("justice", "justly", "oppression", "righteousness"),
    "marriage": ("marriage", "husband", "wife", "one flesh"),
    "friendship": ("friend", "friends", "companion", "brother"),
    "money": ("money", "wealth", "riches", "treasure"),
    "work": ("work", "labor", "diligent", "toil"),
    "humility": ("humble", "humility", "meek", "lowly"),
    "purpose": ("purpose", "called", "prepared", "will"),
    "joy": ("joy", "rejoice", "glad", "delight"),
    "patience": ("patience", "patient", "endurance", "wait"),
    "kindness": ("kindness", "kind", "compassion", "gentleness"),
}


class BibleFinderError(Exception):
    """Base class for friendly, expected Bible Finder errors."""


class MissingAPIKeyError(BibleFinderError):
    """Raised when ESV_API_KEY has not been configured."""


class AuthenticationError(BibleFinderError):
    """Raised when the ESV API rejects the configured key."""


class RateLimitError(BibleFinderError):
    """Raised when the ESV API rate limit is reached."""


class NetworkError(BibleFinderError):
    """Raised when the ESV API cannot be reached."""


class APIResponseError(BibleFinderError):
    """Raised when the ESV API returns an invalid or unexpected response."""


class RequestInterruptedError(BibleFinderError):
    """Raised when a request is interrupted by the user."""


@dataclass(frozen=True)
class VerseResult:
    """One complete verse returned by the ESV passage-search API."""

    reference: str
    content: str


@dataclass(frozen=True)
class APISearchResult:
    """All results that may be retrieved for one API query."""

    results: tuple[VerseResult, ...]
    total_results: int
    total_pages: int
    retrieval_limited: bool


@dataclass(frozen=True)
class SearchResults:
    """Processed search results ready for terminal display."""

    query: str
    mode: str
    terms: tuple[str, ...]
    results: tuple[VerseResult, ...]
    total_reported: int
    unique_retrieved: int
    duplicates_removed: int
    licensing_limited: bool


@dataclass(frozen=True)
class HistoryEntry:
    """A search performed during the current process."""

    mode: str
    query: str
    result_count: int
    searched_at: datetime


class ESVClient:
    """Small, rate-limited client for the official ESV passage search API."""

    def __init__(
        self,
        api_key: str,
        *,
        opener: Callable[..., object] = urlopen,
        timeout: float = 15.0,
        request_interval: float = REQUEST_INTERVAL_SECONDS,
        clock: Callable[[], float] = time.monotonic,
        sleeper: Callable[[float], None] = time.sleep,
    ) -> None:
        if not api_key or not api_key.strip():
            raise MissingAPIKeyError(missing_key_message())
        self._api_key = api_key.strip()
        self._opener = opener
        self._timeout = timeout
        self._request_interval = max(0.0, request_interval)
        self._clock = clock
        self._sleeper = sleeper
        self._last_request_at: float | None = None

    @classmethod
    def from_environment(
        cls, env: Mapping[str, str] | None = None, **kwargs: object
    ) -> "ESVClient":
        """Create a client from ESV_API_KEY without ever exposing the key."""

        source = os.environ if env is None else env
        return cls(source.get("ESV_API_KEY", ""), **kwargs)

    def search(self, query: str) -> APISearchResult:
        """Fetch every page permitted by the ESV 500-verse query limit."""

        cleaned = query.strip()
        if not cleaned:
            raise ValueError("Please enter a word or phrase to search.")

        first = self._request_page(cleaned, page=1)
        total_pages = first[2]
        permitted_pages = min(total_pages, MAX_VERSES // API_PAGE_SIZE)
        verses = list(first[0])

        for page in range(2, permitted_pages + 1):
            page_results, _, response_pages = self._request_page(cleaned, page=page)
            if response_pages != total_pages:
                raise APIResponseError(
                    "The ESV API changed its pagination while this search was running. Please try again."
                )
            verses.extend(page_results)

        verses = verses[:MAX_VERSES]
        total_results = first[1]
        limited = total_results > len(verses) or total_pages > permitted_pages
        return APISearchResult(tuple(verses), total_results, total_pages, limited)

    def _throttle(self) -> None:
        """Space calls so this client remains below 60 API requests per minute."""

        if self._last_request_at is not None:
            wait_for = self._request_interval - (self._clock() - self._last_request_at)
            if wait_for > 0:
                self._sleeper(wait_for)
        self._last_request_at = self._clock()

    def _request_page(self, query: str, page: int) -> tuple[tuple[VerseResult, ...], int, int]:
        params = urlencode({"q": query, "page-size": API_PAGE_SIZE, "page": page})
        request = Request(
            f"{API_URL}?{params}",
            headers={
                "Authorization": f"Token {self._api_key}",
                "Accept": "application/json",
                "User-Agent": "Bible-Finder/1.0 (terminal; non-commercial)",
            },
        )
        try:
            self._throttle()
            with self._opener(request, timeout=self._timeout) as response:  # type: ignore[attr-defined]
                payload = json.load(response)  # type: ignore[arg-type]
        except HTTPError as error:
            error.close()
            if error.code in (401, 403):
                raise AuthenticationError(
                    "The ESV API rejected the API key. Check ESV_API_KEY and try again."
                ) from None
            if error.code == 429:
                raise RateLimitError(
                    "The ESV API rate limit was reached. Please wait a minute, then try again."
                ) from None
            raise NetworkError(
                f"The ESV API returned HTTP {error.code}. Please try again later."
            ) from None
        except (URLError, socket.timeout, TimeoutError) as error:
            reason = getattr(error, "reason", error)
            raise NetworkError(
                f"Bible Finder could not reach the ESV API ({reason}). Check your internet connection."
            ) from None
        except (json.JSONDecodeError, UnicodeDecodeError):
            raise APIResponseError(
                "The ESV API returned a response Bible Finder could not read. Please try again."
            ) from None
        except KeyboardInterrupt:
            raise RequestInterruptedError("The ESV request was interrupted.") from None

        return validate_search_payload(payload, expected_page=page)


def validate_search_payload(
    payload: object, *, expected_page: int
) -> tuple[tuple[VerseResult, ...], int, int]:
    """Validate and convert an ESV passage-search JSON response."""

    if not isinstance(payload, dict):
        raise APIResponseError("The ESV API returned a malformed response.")
    page = payload.get("page")
    total_results = payload.get("total_results")
    total_pages = payload.get("total_pages")
    raw_results = payload.get("results")
    integers_valid = all(
        isinstance(value, int) and not isinstance(value, bool)
        for value in (page, total_results, total_pages)
    )
    if (
        not integers_valid
        or page != expected_page
        or total_results < 0
        or total_pages < 0
        or not isinstance(raw_results, list)
    ):
        raise APIResponseError("The ESV API returned malformed search metadata.")

    results: list[VerseResult] = []
    for item in raw_results:
        if not isinstance(item, dict):
            raise APIResponseError("The ESV API returned a malformed verse result.")
        reference = item.get("reference")
        content = item.get("content")
        if not isinstance(reference, str) or not reference.strip() or not isinstance(content, str):
            raise APIResponseError("The ESV API returned a malformed verse result.")
        results.append(VerseResult(reference.strip(), content.strip()))
    return tuple(results), total_results, total_pages


class SearchService:
    """Apply keyword, phrase, and suggested-topic behavior to ESV searches."""

    def __init__(self, client: ESVClient) -> None:
        self._client = client

    def keyword(self, query: str) -> SearchResults:
        """Search the ESV for a word or unquoted query."""

        cleaned = require_query(query)
        response = self._client.search(cleaned)
        return self._finish(
            query=cleaned,
            mode="keyword",
            terms=(cleaned,),
            batches=(response,),
        )

    def exact(self, phrase: str) -> SearchResults:
        """Search the ESV for an exact phrase using API quote syntax."""

        cleaned = require_query(phrase)
        response = self._client.search(f'"{cleaned}"')
        return self._finish(
            query=cleaned,
            mode="exact phrase",
            terms=(cleaned,),
            batches=(response,),
        )

    def topic(self, subject: str) -> SearchResults:
        """Search suggested related terms, or fall back to a keyword search."""

        cleaned = require_query(subject)
        terms = TOPIC_MAP.get(cleaned.casefold())
        if terms is None:
            response = self._client.search(cleaned)
            return self._finish(
                query=cleaned,
                mode="topic fallback (keyword)",
                terms=(cleaned,),
                batches=(response,),
            )
        batches = tuple(self._client.search(term) for term in terms)
        return self._finish(
            query=cleaned,
            mode="topic suggestions",
            terms=terms,
            batches=batches,
        )

    @staticmethod
    def _finish(
        *, query: str, mode: str, terms: tuple[str, ...], batches: Sequence[APISearchResult]
    ) -> SearchResults:
        merged: dict[str, VerseResult] = {}
        raw_count = 0
        for batch in batches:
            for verse in batch.results:
                raw_count += 1
                merged.setdefault(normalize_reference(verse.reference), verse)

        unique = tuple(merged.values())
        permitted, book_limited = apply_licensing_limits(unique)
        duplicates = raw_count - len(unique)
        retrieval_limited = any(batch.retrieval_limited for batch in batches)
        return SearchResults(
            query=query,
            mode=mode,
            terms=terms,
            results=permitted,
            total_reported=sum(batch.total_results for batch in batches),
            unique_retrieved=len(unique),
            duplicates_removed=duplicates,
            licensing_limited=retrieval_limited or book_limited or len(permitted) < len(unique),
        )


def require_query(query: str) -> str:
    """Return a trimmed query or raise a friendly validation error."""

    cleaned = query.strip()
    if not cleaned:
        raise ValueError("Please enter a word or phrase to search.")
    return cleaned


def normalize_reference(reference: str) -> str:
    """Create a stable, case-insensitive key for verse deduplication."""

    return " ".join(reference.casefold().split())


def reference_book(reference: str) -> str | None:
    """Extract a canonical book name from a single-verse API reference."""

    match = re.match(r"^(.+?)\s+\d+:\d+", reference.strip())
    return match.group(1) if match else None


def apply_licensing_limits(
    verses: Sequence[VerseResult],
) -> tuple[tuple[VerseResult, ...], bool]:
    """Enforce the 500-verse and half-of-each-book display limits."""

    permitted: list[VerseResult] = []
    per_book: dict[str, int] = {}
    limited = False
    for verse in verses:
        if len(permitted) >= MAX_VERSES:
            limited = True
            break
        book = reference_book(verse.reference)
        if book and book not in SHORT_BOOK_EXCEPTIONS:
            total = BOOK_VERSE_TOTALS.get(book)
            if total is None:
                # Unknown reference formats are omitted conservatively.
                limited = True
                continue
            maximum = total // 2
            if per_book.get(book, 0) >= maximum:
                limited = True
                continue
            per_book[book] = per_book.get(book, 0) + 1
        permitted.append(verse)
    return tuple(permitted), limited


def passage_url(reference: str) -> str:
    """Build a correctly encoded ESV.org passage link."""

    return f"https://www.esv.org/{quote_plus(reference, safe='')}/"


class Palette:
    """ANSI palette that becomes a no-op when color is unavailable."""

    def __init__(self, enabled: bool) -> None:
        self.enabled = enabled
        self.blue = "\033[38;5;25m" if enabled else ""
        self.gold = "\033[38;5;178m" if enabled else ""
        self.white = "\033[38;5;255m" if enabled else ""
        self.muted = "\033[38;5;250m" if enabled else ""
        self.bold = "\033[1m" if enabled else ""
        self.reset = "\033[0m" if enabled else ""


def color_supported(stream: TextIO = sys.stdout, env: Mapping[str, str] | None = None) -> bool:
    """Return whether ANSI color should be used for this output stream."""

    source = os.environ if env is None else env
    return bool(
        hasattr(stream, "isatty")
        and stream.isatty()
        and source.get("TERM", "").casefold() != "dumb"
        and "NO_COLOR" not in source
    )


def highlight(text: str, terms: Iterable[str], palette: Palette) -> str:
    """Highlight literal matches with ANSI codes without changing Scripture."""

    usable = sorted({term for term in terms if term}, key=len, reverse=True)
    if not palette.enabled or not usable:
        return text
    pattern = re.compile("|".join(re.escape(term) for term in usable), re.IGNORECASE)
    return pattern.sub(lambda match: f"{palette.gold}{palette.bold}{match.group(0)}{palette.reset}{palette.white}", text)


class TerminalApp:
    """Interactive and one-command terminal presentation for Bible Finder."""

    def __init__(
        self,
        service: SearchService,
        *,
        palette: Palette,
        output: TextIO = sys.stdout,
        input_fn: Callable[[str], str] = input,
    ) -> None:
        self.service = service
        self.palette = palette
        self.output = output
        self.input_fn = input_fn
        self.history: list[HistoryEntry] = []

    def print(self, text: str = "") -> None:
        """Write one line to the configured terminal output."""

        print(text, file=self.output)

    def banner(self) -> None:
        """Show the compact application title."""

        p = self.palette
        self.print()
        self.print(f"{p.blue}{p.bold}BIBLE FINDER{p.reset} {p.gold}//{p.reset} {p.white}Search the ESV{p.reset}")
        self.print(f"{p.muted}{'\u2500' * 46}{p.reset}")
        self.print(f"{p.white}What are you facing or studying today?{p.reset}")
        self.print(f"{p.muted}Type :help for commands.{p.reset}")
        self.print()

    def run(self) -> None:
        """Run the interactive search loop until quit or end-of-input."""

        self.banner()
        while True:
            try:
                entry = self.input_fn(f"{self.palette.gold}search>{self.palette.reset} ")
            except EOFError:
                self.print("\nPeace be with you.")
                return
            except KeyboardInterrupt:
                self.print("\nType :quit to exit, or enter another search.")
                continue

            cleaned = entry.strip()
            if not cleaned:
                self.print("Please enter a word or phrase to search.")
                continue
            if cleaned.startswith(":"):
                if not self.handle_command(cleaned):
                    return
                continue
            self.perform("keyword", cleaned)

    def handle_command(self, command_line: str) -> bool:
        """Handle a colon command; return False only when quitting."""

        command, _, argument = command_line.partition(" ")
        command = command.casefold()
        argument = argument.strip()
        if command == ":quit":
            self.print("Peace be with you.")
            return False
        if command == ":help":
            self.show_help()
        elif command == ":history":
            self.show_history()
        elif command == ":clear":
            self.clear()
            self.banner()
        elif command == ":about":
            self.show_about()
        elif command == ":topic":
            self.perform("topic", argument)
        elif command == ":exact":
            self.perform("exact", argument)
        else:
            self.print(f"Unknown command: {command}. Type :help for the command list.")
        return True

    def perform(self, mode: str, query: str, *, show_all: bool = False) -> SearchResults | None:
        """Run one search, report expected errors, and display its results."""

        try:
            cleaned = require_query(query)
            if mode == "topic":
                mapped = TOPIC_MAP.get(cleaned.casefold())
                if mapped:
                    self.print(
                        f"\nSuggested topic terms: {', '.join(mapped)}\n"
                        "These associations are broad study suggestions, not exhaustive or divinely authoritative."
                    )
                else:
                    self.print(
                        f"\nNo built-in topic map for \u201c{cleaned}\u201d; using a normal ESV keyword search."
                    )
                results = self.service.topic(cleaned)
            elif mode == "exact":
                results = self.service.exact(cleaned)
            else:
                results = self.service.keyword(cleaned)
        except (ValueError, BibleFinderError) as error:
            self.print(f"\n{error}\n")
            return None

        self.history.append(
            HistoryEntry(results.mode, results.query, len(results.results), datetime.now())
        )
        self.display_results(results, show_all=show_all)
        return results

    def display_results(self, search: SearchResults, *, show_all: bool = False) -> None:
        """Display results ten at a time, or all when explicitly requested."""

        p = self.palette
        self.print()
        self.print(f"{p.blue}{p.bold}{search.mode.upper()}{p.reset} {p.gold}\u2022{p.reset} {search.query}")
        if search.mode == "topic suggestions":
            self.print(
                f"Terms used: {', '.join(search.terms)} | "
                f"API-reported matches across terms: {search.total_reported} | "
                f"duplicates removed: {search.duplicates_removed}"
            )
        else:
            self.print(f"Total matches reported by the ESV API: {search.total_reported}")

        if not search.results:
            self.print("\nNo matching verses were found. Try another word or :topic <subject>.")
            if search.licensing_limited:
                self.print("Some results could not be displayed under ESV licensing limits.")
            self.print()
            return

        if search.licensing_limited:
            self.print(
                f"Displaying {len(search.results)} permitted unique verse(s). Additional matches "
                "cannot be displayed because the ESV license limits a search to 500 verses "
                "and no more than half of any Bible book."
            )
        elif search.mode == "topic suggestions":
            self.print(f"Unique verses: {len(search.results)}")

        index = 0
        page_size = len(search.results) if show_all else DISPLAY_PAGE_SIZE
        while index < len(search.results):
            end = min(index + page_size, len(search.results))
            self.print(f"\n{p.muted}Showing {index + 1}\u2013{end} of {len(search.results)}{p.reset}")
            self.print()
            for number in range(index, end):
                self.print_verse(number + 1, search.results[number], search.terms)
            self.show_copyright()
            index = end
            if index >= len(search.results) or show_all:
                break
            try:
                action = self.input_fn(
                    f"\n{p.muted}Enter: next 10  \u2022  a: all remaining  \u2022  q: search prompt{p.reset}\n> "
                ).strip().casefold()
            except EOFError:
                return
            except KeyboardInterrupt:
                self.print("\nReturning to the search prompt.")
                return
            if action == "q":
                return
            if action == "a":
                page_size = len(search.results)

    def print_verse(self, number: int, verse: VerseResult, terms: Iterable[str]) -> None:
        """Print a complete, labeled ESV verse and its ESV.org link."""

        p = self.palette
        self.print(f"{p.gold}[{number}]{p.reset} {p.bold}{verse.reference}{p.reset} {p.gold}\u2014 ESV{p.reset}")
        width = max(40, min(92, terminal_width() - 4))
        lines = textwrap.wrap(
            verse.content,
            width=width,
            replace_whitespace=False,
            drop_whitespace=True,
            break_long_words=False,
            break_on_hyphens=False,
        ) or [""]
        for line in lines:
            self.print(f"{p.white}{highlight(line, terms, p)}{p.reset}")
        self.print(f"\n{p.muted}Open passage:{p.reset}\n{passage_url(verse.reference)}\n")

    def show_copyright(self) -> None:
        """Display Crossway's standard ESV copyright notice."""

        p = self.palette
        self.print(f"{p.muted}{'\u2500' * 46}{p.reset}")
        for paragraph in COPYRIGHT_NOTICE.split("\n\n"):
            self.print(textwrap.fill(paragraph, width=max(50, min(92, terminal_width()))))
            self.print()
        self.print("https://www.esv.org/")

    def show_help(self) -> None:
        """Print interactive usage instructions."""

        self.print(
            """
Commands
  :help              Show these instructions
  :topic <subject>   Search suggested related words and deduplicate verses
  :exact <phrase>    Search for an exact phrase
  :history           Show searches from this session
  :clear             Clear the terminal
  :about             Explain Bible Finder and its ESV source
  :quit              Exit safely

Plain text performs an ESV keyword search. Results appear ten at a time.
Press Enter for the next ten, a for all permitted results, or q to search again.
""".strip()
        )

    def show_history(self) -> None:
        """Print in-memory searches from this process only."""

        if not self.history:
            self.print("No searches yet in this session.")
            return
        self.print("\nSession search history")
        for index, item in enumerate(self.history, 1):
            stamp = item.searched_at.strftime("%H:%M:%S")
            self.print(
                f"  {index}. [{stamp}] {item.mode}: {item.query} "
                f"({item.result_count} displayed result(s))"
            )

    def show_about(self) -> None:
        """Describe sourcing, storage, and topical-search limitations."""

        self.print(
            """
Bible Finder searches the complete English Standard Version through Crossway's
official ESV passage-search API. ESV Scripture is copyrighted, so no Bible text
is bundled, cached, or written to disk. Search responses exist only in memory.

Keyword and exact-phrase modes report ESV word matches. Topic mode combines a
small human-curated list of related search terms; these suggestions are neither
exhaustive nor divinely authoritative. Every quotation is labeled ESV and links
to its passage at ESV.org.
""".strip()
        )

    def clear(self) -> None:
        """Clear an ANSI terminal, with a harmless non-terminal fallback."""

        if hasattr(self.output, "isatty") and self.output.isatty():
            self.output.write("\033[2J\033[H")
            self.output.flush()
        else:
            self.print("\n" * 40)


def terminal_width() -> int:
    """Return a conservative display width without requiring a TTY."""

    try:
        return os.get_terminal_size().columns
    except OSError:
        return 80


def missing_key_message() -> str:
    """Explain exactly how to obtain and configure an ESV API key."""

    return (
        "ESV_API_KEY is not set.\n\n"
        "1. Sign in or create an account, then create an API application at:\n"
        f"   {ESV_APPLICATION_URL}\n"
        "2. Copy the API key and set it for this terminal session:\n\n"
        '   export ESV_API_KEY="your-key-here"\n'
        "   python3 bible_finder.py\n\n"
        "Bible Finder will not print, save, or commit your key."
    )


def build_parser() -> argparse.ArgumentParser:
    """Create the one-command CLI parser."""

    parser = argparse.ArgumentParser(
        description="Search the ESV through the official API from your terminal."
    )
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--topic", metavar="SUBJECT", help="broaden a built-in topic")
    mode.add_argument("--exact", metavar="PHRASE", help="search an exact phrase")
    parser.add_argument("--all", action="store_true", help="show all remaining permitted results")
    parser.add_argument("--no-color", action="store_true", help="disable ANSI colors")
    parser.add_argument("query", nargs="*", help="keyword or phrase to search")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """Run Bible Finder and return a shell-friendly status code."""

    parser = build_parser()
    args = parser.parse_args(argv)
    positional = " ".join(args.query).strip()
    if (args.topic or args.exact) and positional:
        parser.error("do not combine a positional query with --topic or --exact")

    try:
        client = ESVClient.from_environment()
    except MissingAPIKeyError as error:
        print(error, file=sys.stderr)
        return 2

    palette = Palette(not args.no_color and color_supported())
    app = TerminalApp(SearchService(client), palette=palette)
    try:
        if args.topic is not None:
            return 0 if app.perform("topic", args.topic, show_all=args.all) is not None else 1
        if args.exact is not None:
            return 0 if app.perform("exact", args.exact, show_all=args.all) is not None else 1
        if positional:
            return 0 if app.perform("keyword", positional, show_all=args.all) is not None else 1
        if args.all:
            parser.error("--all requires a query, --topic, or --exact")
        app.run()
        return 0
    except KeyboardInterrupt:
        print("\nRequest interrupted. Peace be with you.")
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
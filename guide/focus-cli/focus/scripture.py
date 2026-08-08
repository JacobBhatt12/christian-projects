from __future__ import annotations

import json
import re
from dataclasses import dataclass
from importlib import resources


@dataclass(frozen=True)
class Verse:
    reference: str
    text: str
    topics: tuple[str, ...]


class ScriptureLibrary:
    def __init__(self) -> None:
        verse_file = resources.files("focus").joinpath("data/verses.json")
        try:
            raw = json.loads(verse_file.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"The offline Scripture collection could not be loaded: {exc}") from exc

        self.verses = [
            Verse(
                reference=str(item["reference"]),
                text=str(item["text"]),
                topics=tuple(str(topic).lower() for topic in item["topics"]),
            )
            for item in raw
        ]

    @property
    def topics(self) -> list[str]:
        return sorted({topic for verse in self.verses for topic in verse.topics})

    def search(self, query: str) -> list[Verse]:
        terms = [term for term in re.split(r"\s+", query.lower().strip()) if term]
        if not terms:
            return list(self.verses)
        return [
            verse
            for verse in self.verses
            if all(
                term in f"{verse.reference} {verse.text} {' '.join(verse.topics)}".lower()
                for term in terms
            )
        ]

    def by_topic(self, topic: str) -> list[Verse]:
        topic = topic.lower().strip()
        return [verse for verse in self.verses if topic in verse.topics]

    def for_session(self, work: str, serves: str) -> Verse:
        words = f"{work} {serves}".lower()
        if any(word in words for word in ("bug", "debug", "fix", "difficult", "stuck")):
            preferred = "perseverance"
        elif any(word in words for word in ("learn", "study", "decide", "design", "plan")):
            preferred = "wisdom"
        elif any(word in words for word in ("rest", "health", "break")):
            preferred = "rest"
        elif any(word in words for word in ("people", "user", "team", "church", "community")):
            preferred = "service"
        else:
            preferred = "excellence"
        return self.by_topic(preferred)[0]


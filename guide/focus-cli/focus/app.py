from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Callable
from uuid import uuid4

from .console import Console
from .focus_timer import format_duration, run_focus_timer
from .scripture import ScriptureLibrary, Verse
from .storage import Storage, StorageError


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def parse_time(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def session_days(sessions: list[dict]) -> set[date]:
    days = set()
    for session in sessions:
        try:
            days.add(date.fromisoformat(str(session["local_day"])))
        except (KeyError, TypeError, ValueError):
            continue
    return days


def safe_seconds(value: object) -> int:
    try:
        return max(0, int(value))
    except (TypeError, ValueError):
        return 0


def consistency_streak(sessions: list[dict], today: date | None = None) -> int:
    today = today or date.today()
    days = session_days(sessions)
    if not days:
        return 0

    cursor = today if today in days else today - timedelta(days=1)
    if cursor not in days:
        return 0
    streak = 0
    while cursor in days:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


class FocusApp:
    DEBUG_CHECKLIST = [
        "Reproduce the problem with the smallest input you can.",
        "Read the full error and inspect the values at the failure point.",
        "Separate what you know from what you are assuming.",
        "Narrow the change until one cause remains.",
        "Add or update a test before calling the fix finished.",
    ]

    def __init__(
        self,
        storage: Storage,
        console: Console,
        scripture: ScriptureLibrary,
        clock: Callable[[], datetime] = now_utc,
        timer: Callable[..., tuple[int, bool]] = run_focus_timer,
    ) -> None:
        self.storage = storage
        self.console = console
        self.scripture = scripture
        self.clock = clock
        self.timer = timer

    def start(
        self,
        building: str | None = None,
        serves: str | None = None,
        timer_minutes: int | None = None,
        no_timer: bool = False,
    ) -> int:
        active = self.storage.data["active_session"]
        if active:
            self.console.warning(
                f"A session for “{active.get('project', 'your work')}” is already open."
            )
            self.console.note("Run `focus reflect` before beginning another session.")
            return 1

        self.console.header(self.storage.config["display_name"])
        self.console.note("Purpose is a response to grace, never a way to earn God’s favor.")
        self.console.write()
        project = (building or "").strip() or self.console.ask_required("What are you building?")
        beneficiary = (serves or "").strip() or self.console.ask_required(
            "Who will this work serve?"
        )
        verse = self.scripture.for_session(project, beneficiary)
        self._show_verse(verse, "Scripture for this session")

        configured_minutes = int(self.storage.config["timer_minutes"])
        if timer_minutes is not None:
            use_timer = True
            configured_minutes = timer_minutes
        elif no_timer:
            use_timer = False
        else:
            use_timer = self.console.confirm(
                f"Start a {configured_minutes}-minute focus timer?", default=True
            )

        started = self.clock()
        session = {
            "id": uuid4().hex,
            "project": project,
            "serves": beneficiary,
            "started_at": started.isoformat(),
            "local_day": started.astimezone().date().isoformat(),
            "verse_reference": verse.reference,
            "timer_used": use_timer,
            "planned_minutes": configured_minutes if use_timer else 0,
            "timer_seconds": 0,
            "timer_completed": False,
        }
        self.storage.data["active_session"] = session
        self.storage.save_data()
        self.console.success("Session saved. Work faithfully, and leave the outcome with God.")

        if use_timer:
            elapsed, completed = self.timer(configured_minutes, self.console)
            session["timer_seconds"] = elapsed
            session["timer_completed"] = completed
            self.storage.save_data()

        self.console.note("When you finish, run `focus reflect`.")
        return 0

    def debug(self) -> int:
        self.console.header(self.storage.config["display_name"])
        self.console.panel(
            "Debug without panic",
            [
                "Slow down and make the problem concrete. A bug is information, not a verdict on your ability.",
                "Work through the questions honestly; Focus will save the notes locally.",
            ],
        )
        expected = self.console.ask_required("What did you expect to happen?")
        actual = self.console.ask_required("What actually happened?")
        recent = self.console.ask_required("What changed recently?")
        attempted = self.console.ask_required("What have you already tried?")

        self.console.write()
        self.console.note("Now walk the trail one careful step at a time.")
        checks = []
        for item in self.DEBUG_CHECKLIST:
            done = self.console.confirm(item, default=False)
            checks.append({"item": item, "completed": done})

        active = self.storage.data["active_session"] or {}
        record = {
            "id": uuid4().hex,
            "created_at": self.clock().isoformat(),
            "project": active.get("project", ""),
            "expected": expected,
            "actual": actual,
            "recent_changes": recent,
            "attempted_fixes": attempted,
            "checklist": checks,
        }
        self.storage.data["debug_sessions"].append(record)
        self.storage.save_data()
        completed = sum(check["completed"] for check in checks)
        self.console.success(f"Debug notes saved locally ({completed}/{len(checks)} checks marked).")
        return 0

    def pray(self) -> int:
        self.console.header(self.storage.config["display_name"])
        self.console.panel(
            "ACTS prayer",
            [
                "Be still for a moment. Prayer is communion with God, not another task to optimize.",
                "Your notes stay in your local JSON file and are not encrypted.",
            ],
            color="gold",
        )
        prompts = [
            ("adoration", "Adoration — praise God for who He is"),
            ("confession", "Confession — bring sin and need into His light"),
            ("thanksgiving", "Thanksgiving — name gifts and graces you have received"),
            ("supplication", "Supplication — ask for help for others and yourself"),
        ]
        notes = {key: self.console.ask(label) for key, label in prompts}
        if not any(notes.values()):
            self.console.note("No written notes were added. Quiet prayer still matters.")

        if self.console.confirm("Save these private notes locally?", default=False):
            record = {
                "id": uuid4().hex,
                "created_at": self.clock().isoformat(),
                **notes,
            }
            self.storage.data["prayer_notes"].append(record)
            self.storage.save_data()
            self.console.success("Prayer notes saved locally.")
        else:
            self.console.note("Prayer notes discarded. Nothing was written to your data file.")
        return 0

    def reflect(self) -> int:
        active = self.storage.data["active_session"]
        if not active:
            self.console.warning("There is no active coding session to reflect on.")
            self.console.note("Begin one with `focus start`.")
            return 1

        self.console.header(self.storage.config["display_name"])
        self.console.panel(
            "Close the loop",
            [
                f"Project: {active['project']}",
                "Notice what God supplied, what remains unfinished, and whom the work served.",
            ],
            color="green",
        )
        completed = self.console.ask_required("What did you complete?")
        learned = self.console.ask_required("What did you learn?")
        help_needed = self.console.ask("Where do you still need help?")
        service = self.console.ask_required("How did this work serve others?")
        project_completed = self.console.confirm("Is this project now complete?", default=False)

        ended = self.clock()
        try:
            coding_seconds = max(0, int((ended - parse_time(active["started_at"])).total_seconds()))
        except (KeyError, TypeError, ValueError):
            coding_seconds = safe_seconds(active.get("timer_seconds", 0))
        focus_seconds = (
            safe_seconds(active.get("timer_seconds", 0))
            if active.get("timer_used")
            else coding_seconds
        )
        record = {
            **active,
            "ended_at": ended.isoformat(),
            "local_day": ended.astimezone().date().isoformat(),
            "coding_seconds": coding_seconds,
            "focus_seconds": focus_seconds,
            "completed": completed,
            "learned": learned,
            "help_needed": help_needed,
            "service_reflection": service,
            "project_completed": project_completed,
        }
        self.storage.data["sessions"].append(record)
        self.storage.data["active_session"] = None
        self.storage.save_data()

        self.console.success(f"Session complete — {format_duration(coding_seconds)} logged.")
        self.console.note("Faithfulness includes rest. Your worth was never riding on this session.")
        return 0

    def stats(self) -> int:
        sessions = self.storage.data["sessions"]
        total_focus = sum(safe_seconds(item.get("focus_seconds", 0)) for item in sessions)
        total_coding = sum(safe_seconds(item.get("coding_seconds", 0)) for item in sessions)
        today = self.clock().astimezone().date()
        streak = consistency_streak(sessions, today)
        completed_projects = {
            item.get("project", "").strip().lower()
            for item in sessions
            if item.get("project_completed") and item.get("project", "").strip()
        }
        recent_days = {day for day in session_days(sessions) if day >= today - timedelta(days=6)}

        self.console.header(self.storage.config["display_name"])
        self.console.panel(
            "Faithful work, at a glance",
            [
                f"Coding sessions       {len(sessions):>8}",
                f"Total focus time      {format_duration(total_focus):>8}",
                f"Coding time logged    {format_duration(total_coding):>8}",
                f"Current streak        {streak:>6} day{'s' if streak != 1 else ' '}",
                f"Completed projects    {len(completed_projects):>8}",
                "",
                f"Last 7 days  {self.console.progress_bar(len(recent_days), 7, width=28)}  {len(recent_days)}/7",
            ],
            color="green",
        )

        if sessions:
            lines = []
            for item in reversed(sessions[-3:]):
                day = item.get("local_day", "unknown date")
                lines.append(f"{day}  {item.get('project', 'Untitled')}")
                lines.append(f"  Finished: {item.get('completed', '—')}")
                lines.append(f"  Learned:  {item.get('learned', '—')}")
            self.console.panel("Recent reflections", lines, color="blue")
        else:
            self.console.note("No completed sessions yet. Begin with `focus start`.")
        self.console.note("These numbers are a record, not a measure of God’s love or your worth.")
        return 0

    def verses(self, query: str | None = None, topic: str | None = None) -> int:
        self.console.header(self.storage.config["display_name"])
        if topic:
            matches = self.scripture.by_topic(topic)
            heading = f"Topic: {topic.lower()}"
        elif query:
            matches = self.scripture.search(query)
            heading = f"Search: {query}"
        else:
            topics = ", ".join(self.scripture.topics)
            self.console.panel("Offline KJV topics", [topics])
            choice = self.console.ask("Enter a topic or search phrase (blank shows all)")
            matches = self.scripture.by_topic(choice)
            if choice and not matches:
                matches = self.scripture.search(choice)
            heading = f"Verses for: {choice or 'all topics'}"

        if not matches:
            self.console.warning("No passages matched. Try a topic or fewer search words.")
            return 1
        self.console.write(self.console.style(f"  {heading} · {len(matches)} passage(s)", "gold"))
        self.console.write()
        for verse in matches:
            self._show_verse(verse, verse.reference, include_reference=False)
        self.console.note("Scripture quotations are from the public-domain King James Version.")
        return 0

    def config(self, show_only: bool = False) -> int:
        current = self.storage.config
        self.console.header(current["display_name"])
        self.console.panel(
            "Current configuration",
            [
                f"Display name   {current['display_name'] or '—'}",
                f"Color          {current['color']}",
                f"Timer          {current['timer_minutes']} minutes",
                f"Data directory {current['data_dir']}",
            ],
        )
        if show_only:
            return 0

        name = self.console.ask("Display name (use '-' to clear)", current["display_name"])
        if name == "-":
            name = ""
        color = self.console.choose(
            "Color output", ["auto", "always", "never"], current["color"]
        )
        while True:
            raw_minutes = self.console.ask("Default timer length in minutes", str(current["timer_minutes"]))
            try:
                minutes = int(raw_minutes)
                if 1 <= minutes <= 480:
                    break
            except ValueError:
                pass
            self.console.warning("Enter a whole number from 1 to 480.")

        self.storage.update_preferences(name, color, minutes)
        requested_dir = self.console.ask("Data directory", current["data_dir"])
        new_dir = Path(requested_dir).expanduser()
        current_dir = Path(current["data_dir"]).expanduser()
        if new_dir.resolve() != current_dir.resolve():
            existing = (new_dir / "focus-data.json").exists()
            use_existing = False
            if existing:
                use_existing = self.console.confirm(
                    "Existing Focus data found there. Switch to it?", default=False
                )
                if not use_existing:
                    self.console.note("Data directory was left unchanged.")
                    self.console.success("Other preferences saved.")
                    return 0
            self.storage.change_data_dir(new_dir, use_existing=use_existing)
            action = "Switched to existing data" if existing else "Copied current data"
            self.console.note(f"{action} in {new_dir.resolve()}.")
        self.console.success("Configuration saved. Color changes apply on the next command.")
        return 0

    def menu(self) -> int:
        actions = {
            "1": ("Start a coding session", self.start),
            "2": ("Work through a bug", self.debug),
            "3": ("Pray with ACTS", self.pray),
            "4": ("Reflect and close a session", self.reflect),
            "5": ("View stats", self.stats),
            "6": ("Browse KJV passages", self.verses),
            "7": ("Configure Focus", self.config),
        }
        while True:
            self.console.header(self.storage.config["display_name"])
            for key, (label, _) in actions.items():
                self.console.write(f"  {self.console.style(key, 'gold')}  {label}")
            self.console.write("  q  Leave quietly")
            self.console.write()
            choice = self.console.ask("Choose an action").lower()
            if choice in {"q", "quit", "exit"}:
                self.console.note("Go in peace.")
                return 0
            action = actions.get(choice)
            if not action:
                self.console.warning("Choose 1–7, or q to quit.")
                continue
            self.console.write()
            action[1]()
            self.console.write()
            self.console.ask("Press Enter to return to the menu")

    def _show_verse(self, verse: Verse, title: str, include_reference: bool = True) -> None:
        lines = [f"“{verse.text}”"]
        if include_reference:
            lines.append(f"— {verse.reference} (KJV)")
        else:
            lines.append(f"Topics: {', '.join(verse.topics)}")
        self.console.panel(title, lines, color="gold")

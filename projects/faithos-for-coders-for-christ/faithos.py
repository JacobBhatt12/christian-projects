#!/usr/bin/env python3
"""FaithOS for Coders for Christ.

A small command-center-style terminal app for Christian developers.
The code favors plain functions and simple data structures so it is easy to
read, change, and make your own.
"""

from __future__ import annotations

import argparse
import json
import time
from datetime import date, datetime
from pathlib import Path

from rich.align import Align
from rich.console import Console, Group
from rich.panel import Panel
from rich.progress import BarColumn, Progress, TextColumn
from rich.prompt import Prompt
from rich.rule import Rule
from rich.table import Table
from rich.text import Text


APP_DIR = Path(__file__).resolve().parent
JOURNAL_FILE = APP_DIR / "gratitude_journal.json"

# The palette is deliberately small. It keeps the interface calm and gives
# every color a job: green = action, cyan = system, gold = sacred/highlight.
GREEN = "bright_green"
CYAN = "bright_cyan"
WHITE = "bright_white"
GOLD = "rgb(255,195,64)"
MUTED = "grey66"

LOGO = """[bright_green]
████  ███  █████ █████ █  █  ███   ███
█    █   █   █     █   █  █ █   █ █
███  █████   █     █   ████ █   █  ███
█    █   █   █     █   █  █ █   █     █
█    █   █ █████   █   █  █  ███   ███
[/bright_green]"""

VERSES = [
    (
        "Colossians 3:23",
        "And whatsoever ye do, do it heartily, as to the Lord, "
        "and not unto men.",
    ),
    (
        "Proverbs 16:3",
        "Commit thy works unto the Lord, and thy thoughts shall be established.",
    ),
    (
        "Philippians 4:13",
        "I can do all things through Christ which strengtheneth me.",
    ),
    (
        "Psalm 90:17",
        "Establish thou the work of our hands upon us; yea, the work of our "
        "hands establish thou it.",
    ),
    (
        "Micah 6:8",
        "What doth the Lord require of thee, but to do justly, and to love "
        "mercy, and to walk humbly with thy God?",
    ),
    (
        "Matthew 5:16",
        "Let your light so shine before men, that they may see your good works, "
        "and glorify your Father which is in heaven.",
    ),
    (
        "1 Corinthians 10:31",
        "Whether therefore ye eat, or drink, or whatsoever ye do, do all to "
        "the glory of God.",
    ),
]

MISSIONS = [
    {
        "title": "THE KINDNESS FUNCTION",
        "brief": "Write a function that turns a name into a sincere word of encouragement.",
        "steps": ["Accept one name", "Return a custom message", "Handle an empty input kindly"],
    },
    {
        "title": "THE GOOD STEWARD REFACTOR",
        "brief": "Improve one small piece of old code without changing what it does.",
        "steps": ["Rename one unclear variable", "Remove duplication", "Add one useful test"],
    },
    {
        "title": "ACCESS FOR ALL",
        "brief": "Make one screen or script easier for another person to use.",
        "steps": ["Find one point of friction", "Improve the wording or flow", "Ask someone to try it"],
    },
    {
        "title": "THE QUIET AUTOMATION",
        "brief": "Automate one repetitive task that could give someone time back.",
        "steps": ["Choose a five-minute chore", "Build the smallest solution", "Document it in three lines"],
    },
    {
        "title": "LIGHT IN THE LOGS",
        "brief": "Replace one confusing error with a message that genuinely helps the next person.",
        "steps": ["Reproduce the failure", "Write a clear message", "Point toward the next action"],
    },
    {
        "title": "SERVE THE OPEN SOURCE NEIGHBOR",
        "brief": "Make one small, useful contribution to a project you appreciate.",
        "steps": ["Fix a typo or tiny bug", "Follow the project guide", "Thank the maintainer"],
    },
    {
        "title": "SABBATH FOR THE CODEBASE",
        "brief": "Delete or simplify something your project no longer needs.",
        "steps": ["Find one unused piece", "Verify it is safe to remove", "Leave the code calmer"],
    },
]


def panel_width(console: Console) -> int:
    """Keep panels readable on large screens and usable on narrow ones."""
    return max(34, min(console.width, 68))


def typewrite(
    console: Console,
    message: str,
    *,
    style: str = WHITE,
    delay: float = 0.018,
    end: str = "\n",
) -> None:
    """Print a line one character at a time."""
    for character in message:
        console.print(character, style=style, end="", highlight=False)
        if delay:
            time.sleep(delay)
    console.print(end=end)


def logo_panel(console: Console, subtitle: str = "CODERS FOR CHRIST // FAITH ONLINE") -> Panel:
    """Build the responsive FaithOS masthead."""
    if console.width < 50:
        mark = Text("F A I T H O S", style=f"bold {GREEN}", justify="center")
    else:
        mark = Text.from_markup(LOGO, justify="center")

    caption = Text(subtitle, style=f"bold {CYAN}", justify="center")
    return Panel(
        Group(mark, Text(""), caption),
        border_style=GREEN,
        width=panel_width(console),
        padding=(0, 1),
    )


def boot_sequence(console: Console, *, quick: bool = False) -> None:
    """Run a short cinematic startup sequence."""
    console.clear()
    console.print(Align.center(logo_panel(console)))
    console.print()
    typewrite(
        console,
        "  INITIALIZING KINGDOM WORKSPACE...",
        style=CYAN,
        delay=0.010 if quick else 0.022,
    )

    pause = 0.035 if quick else 0.055
    with Progress(
        TextColumn("  [bright_cyan]BOOT[/]"),
        BarColumn(bar_width=None, complete_style=GREEN, finished_style=GREEN),
        TextColumn("[bright_white]{task.percentage:>3.0f}%[/]"),
        console=console,
        transient=True,
    ) as progress:
        task = progress.add_task("boot", total=24)
        for _ in range(24):
            time.sleep(pause)
            progress.advance(task)

    typewrite(
        console,
        "  SCRIPTURE CORE ........ ONLINE",
        style=GREEN,
        delay=0.008 if quick else 0.016,
    )
    typewrite(
        console,
        "  PURPOSE ENGINE ........ READY",
        style=GREEN,
        delay=0.008 if quick else 0.016,
    )
    time.sleep(0.25 if quick else 0.55)


def daily_index(items: list[object]) -> int:
    """Return a stable selection for the current day."""
    return date.today().toordinal() % len(items)


def verse_panel() -> Panel:
    reference, verse = VERSES[daily_index(VERSES)]
    body = Text()
    body.append(f'“{verse}”\n\n', style=f"italic {WHITE}")
    body.append(f"— {reference}  ·  KJV", style=f"bold {GOLD}")
    return Panel(
        body,
        title=f"[bold {CYAN}]DAILY TRANSMISSION[/]",
        subtitle=f"[{MUTED}]{date.today():%A · %B %d}[/]",
        border_style=CYAN,
        padding=(1, 2),
    )


def show_verse(console: Console, *, pause: bool = True) -> None:
    console.clear()
    console.print(Align.center(logo_panel(console, "DAILY SCRIPTURE FEED")))
    console.print(verse_panel(), width=panel_width(console))
    if pause:
        wait_for_return(console)


def prayer_countdown(console: Console, seconds: int, *, demo: bool = False) -> None:
    """Count down a prayer session and allow Ctrl+C to end gently."""
    heading = "DEMO PRAYER WINDOW" if demo else "PRAYER CHANNEL OPEN"
    console.print(
        Panel(
            Align.center(Text("Breathe. Be still. Pray.", style=f"italic {WHITE}")),
            title=f"[bold {GOLD}]{heading}[/]",
            border_style=GOLD,
            width=panel_width(console),
        )
    )

    try:
        with Progress(
            TextColumn("  [bright_cyan]FOCUS[/]"),
            BarColumn(bar_width=None, complete_style=GOLD, finished_style=GREEN),
            TextColumn("[bright_white]{task.fields[clock]}[/]"),
            console=console,
        ) as progress:
            task = progress.add_task("prayer", total=seconds, clock="00:00")
            for remaining in range(seconds, 0, -1):
                minutes, secs = divmod(remaining, 60)
                progress.update(task, clock=f"{minutes:02d}:{secs:02d}")
                time.sleep(1)
                progress.advance(task)
            progress.update(task, clock="00:00")
    except KeyboardInterrupt:
        console.print("\n  Prayer session closed gently. Every moment counts.", style=CYAN)
        return

    console.print("\n  [bold bright_green]SESSION COMPLETE[/]  Go in peace and build with purpose.")


def prayer_timer(console: Console) -> None:
    console.clear()
    console.print(Align.center(logo_panel(console, "INTERACTIVE PRAYER TIMER")))
    options = Table.grid(padding=(0, 2))
    options.add_column(style=f"bold {GREEN}", justify="right")
    options.add_column(style=WHITE)
    options.add_row("1", "One minute")
    options.add_row("2", "Three minutes")
    options.add_row("3", "Five minutes")
    options.add_row("4", "Custom minutes")
    options.add_row("0", "Return to command center")
    console.print(
        Panel(options, title=f"[bold {CYAN}]SELECT DURATION[/]", border_style=CYAN),
        width=panel_width(console),
    )

    choice = Prompt.ask("  Duration", choices=["0", "1", "2", "3", "4"], default="1")
    if choice == "0":
        return

    minutes = {"1": 1.0, "2": 3.0, "3": 5.0}.get(choice)
    while minutes is None:
        answer = Prompt.ask("  Minutes (for example, 2 or 0.5)", default="1")
        try:
            minutes = float(answer)
            if minutes <= 0 or minutes > 180:
                raise ValueError
        except ValueError:
            minutes = None
            console.print("  Enter a number greater than 0 and no more than 180.", style=GOLD)

    console.print()
    prayer_countdown(console, max(1, round(minutes * 60)))
    wait_for_return(console)


def load_journal() -> list[dict[str, str]]:
    """Load journal entries. A missing journal simply means a fresh start."""
    if not JOURNAL_FILE.exists():
        return []
    try:
        data = json.loads(JOURNAL_FILE.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return [entry for entry in data if isinstance(entry, dict)]
    except (OSError, json.JSONDecodeError):
        pass
    return []


def save_journal(entries: list[dict[str, str]]) -> None:
    """Save journal entries as friendly, readable JSON."""
    JOURNAL_FILE.write_text(
        json.dumps(entries, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def add_gratitude(console: Console) -> None:
    console.print(
        Panel(
            "Name one gift from today—large, small, or still unfolding.",
            title=f"[bold {GOLD}]NEW GRATITUDE ENTRY[/]",
            border_style=GOLD,
        ),
        width=panel_width(console),
    )
    note = Prompt.ask("  I am grateful for").strip()
    if not note:
        console.print("  Nothing saved. The page is here when you are ready.", style=MUTED)
        return

    entries = load_journal()
    entries.append(
        {
            "created_at": datetime.now().astimezone().isoformat(timespec="seconds"),
            "gratitude": note,
        }
    )
    try:
        save_journal(entries)
    except OSError as error:
        console.print(f"  Could not save the journal: {error}", style="bold red")
        return
    console.print(f"  [bold {GREEN}]SAVED[/]  Gratitude changes the atmosphere.")


def view_gratitude(console: Console) -> None:
    entries = load_journal()
    if not entries:
        console.print(
            Panel(
                "Your journal is quiet. Add the first good thing you noticed today.",
                title=f"[bold {CYAN}]GRATITUDE ARCHIVE[/]",
                border_style=CYAN,
            ),
            width=panel_width(console),
        )
        return

    recent = entries[-5:]
    lines = Text()
    for index, entry in enumerate(reversed(recent)):
        timestamp = str(entry.get("created_at", ""))
        try:
            label = datetime.fromisoformat(timestamp).strftime("%b %d · %I:%M %p")
        except ValueError:
            label = "Saved entry"
        lines.append(f"{label}\n", style=f"bold {GOLD}")
        lines.append(str(entry.get("gratitude", "")), style=WHITE)
        if index < len(recent) - 1:
            lines.append("\n\n")

    console.print(
        Panel(
            lines,
            title=f"[bold {CYAN}]LATEST GRATITUDE // {len(entries)} TOTAL[/]",
            border_style=CYAN,
            padding=(1, 2),
        ),
        width=panel_width(console),
    )


def gratitude_journal(console: Console) -> None:
    while True:
        console.clear()
        console.print(Align.center(logo_panel(console, "LOCAL GRATITUDE ARCHIVE")))
        menu = Table.grid(padding=(0, 2))
        menu.add_column(style=f"bold {GREEN}", justify="right")
        menu.add_column(style=WHITE)
        menu.add_row("1", "Add an entry")
        menu.add_row("2", "View recent entries")
        menu.add_row("0", "Return to command center")
        console.print(Panel(menu, border_style=CYAN), width=panel_width(console))
        choice = Prompt.ask("  Journal", choices=["0", "1", "2"], default="1")
        console.print()

        if choice == "0":
            return
        if choice == "1":
            add_gratitude(console)
        else:
            view_gratitude(console)
        wait_for_return(console)


def mission_panel() -> Panel:
    mission = MISSIONS[daily_index(MISSIONS)]
    content = Text()
    content.append(f"{mission['title']}\n", style=f"bold {GOLD}")
    content.append(f"{mission['brief']}\n\n", style=WHITE)
    for step in mission["steps"]:
        content.append("  [ ] ", style=GREEN)
        content.append(f"{step}\n", style=WHITE)
    content.append("\nShip something small. Serve someone real.", style=f"italic {CYAN}")
    return Panel(
        content,
        title=f"[bold {CYAN}]MISSION FOR TODAY[/]",
        subtitle=f"[{MUTED}]ONE DAY · ONE ACT OF SERVICE[/]",
        border_style=GOLD,
        padding=(1, 2),
    )


def show_mission(console: Console, *, pause: bool = True) -> None:
    console.clear()
    console.print(Align.center(logo_panel(console, "PURPOSE ENGINE")))
    console.print(mission_panel(), width=panel_width(console))
    if pause:
        wait_for_return(console)


def menu_panel() -> Panel:
    menu = Table.grid(padding=(0, 2))
    menu.add_column(style=f"bold {GREEN}", justify="right", no_wrap=True)
    menu.add_column(style=WHITE)
    menu.add_row("[1]", "Daily Bible Verse")
    menu.add_row("[2]", "Prayer Timer")
    menu.add_row("[3]", "Gratitude Journal")
    menu.add_row("[4]", "Mission for Today")
    menu.add_row("[0]", "Power Down")
    return Panel(
        menu,
        title=f"[bold {CYAN}]COMMAND CENTER[/]",
        subtitle=f"[{MUTED}]SELECT A NUMBER[/]",
        border_style=GREEN,
        padding=(1, 2),
    )


def wait_for_return(console: Console) -> None:
    Prompt.ask(
        f"\n  [{MUTED}]Press Enter to return[/]",
        default="",
        show_default=False,
    )


def power_down(console: Console) -> None:
    console.clear()
    console.print(Align.center(logo_panel(console, "SESSION COMPLETE")))
    console.print()
    typewrite(console, "  CODE WITH PURPOSE.", style=f"bold {GREEN}", delay=0.018)
    typewrite(console, "  CREATE FOR THE KINGDOM.", style=f"bold {CYAN}", delay=0.018)
    console.print("\n  [bold rgb(255,195,64)]CODERS FOR CHRIST[/]\n")


def demo(console: Console) -> None:
    """Show the strongest parts of FaithOS in roughly 18 seconds."""
    boot_sequence(console, quick=True)

    console.clear()
    console.print(Align.center(logo_panel(console, "15-SECOND GUIDED SYSTEM TOUR")))
    console.print(verse_panel(), width=panel_width(console))
    typewrite(console, "  DAILY WORD RECEIVED.", style=CYAN, delay=0.018)
    time.sleep(0.8)

    console.clear()
    console.print(Align.center(logo_panel(console, "PRAYER MODE")))
    prayer_countdown(console, 4, demo=True)
    time.sleep(0.45)

    console.clear()
    console.print(Align.center(logo_panel(console, "GRATITUDE // PRIVATE + LOCAL")))
    gratitude_preview = Text()
    gratitude_preview.append("TODAY I AM GRATEFUL FOR\n", style=f"bold {GOLD}")
    gratitude_preview.append(
        "the chance to build something that serves another person.",
        style=f"italic {WHITE}",
    )
    console.print(
        Panel(
            gratitude_preview,
            title=f"[bold {CYAN}]ENTRY PREVIEW[/]",
            subtitle=f"[{MUTED}]DEMO DOES NOT SAVE[/]",
            border_style=GREEN,
            padding=(1, 2),
        ),
        width=panel_width(console),
    )
    typewrite(console, "  GRATITUDE BUFFER READY.", style=GREEN, delay=0.018)
    time.sleep(0.8)

    console.clear()
    console.print(Align.center(logo_panel(console, "PURPOSE ENGINE")))
    console.print(mission_panel(), width=panel_width(console))
    typewrite(console, "  MISSION ACCEPTED.", style=CYAN, delay=0.018)
    time.sleep(0.9)

    console.clear()
    console.print(Align.center(logo_panel(console, "CODERS FOR CHRIST")))
    console.print()
    typewrite(console, "CODE WITH PURPOSE.", style=f"bold {GREEN}", delay=0.030)
    typewrite(console, "CREATE FOR THE KINGDOM.", style=f"bold {CYAN}", delay=0.030)
    console.print()
    typewrite(console, "CODERS FOR CHRIST", style=f"bold {GOLD}", delay=0.040)
    console.print()
    # Hold the end card long enough to make the final message easy to read in
    # a Reel before the process exits.
    time.sleep(2.6)


def command_center(console: Console, *, skip_boot: bool = False) -> None:
    if not skip_boot:
        boot_sequence(console)

    while True:
        console.clear()
        console.print(Align.center(logo_panel(console)))
        reference, _ = VERSES[daily_index(VERSES)]
        console.print(
            Rule(
                f"[bold {GOLD}]TODAY // {reference}[/]",
                style=CYAN,
                characters="─",
            ),
            width=panel_width(console),
        )
        console.print(menu_panel(), width=panel_width(console))
        choice = Prompt.ask("  Command", choices=["0", "1", "2", "3", "4"], default="1")

        if choice == "0":
            power_down(console)
            return
        if choice == "1":
            show_verse(console)
        elif choice == "2":
            prayer_timer(console)
        elif choice == "3":
            gratitude_journal(console)
        elif choice == "4":
            show_mission(console)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="FaithOS — a purpose-centered command center for Christian developers."
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="run an automatic 15–20 second tour for screen recording",
    )
    parser.add_argument(
        "--skip-boot",
        action="store_true",
        help="open the menu immediately",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    console = Console(highlight=False, style="on black")
    try:
        if args.demo:
            demo(console)
        else:
            command_center(console, skip_boot=args.skip_boot)
    except (KeyboardInterrupt, EOFError):
        console.print(f"\n\n  [{CYAN}]FaithOS session closed. Grace and peace.[/]\n")


if __name__ == "__main__":
    main()


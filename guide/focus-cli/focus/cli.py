from __future__ import annotations

import argparse
import sys

from . import __version__
from .app import FocusApp
from .console import Console
from .scripture import ScriptureLibrary
from .storage import Storage, StorageError


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="focus",
        description="A terminal companion for purposeful coding, prayer, and reflection.",
        epilog="Whatever you do, do it heartily, as to the Lord. — Colossians 3:23",
    )
    parser.add_argument(
        "--no-color",
        action="store_true",
        help="disable ANSI color output (also honored after a command)",
    )
    parser.add_argument("--version", action="version", version=f"Focus CLI {__version__}")
    subparsers = parser.add_subparsers(dest="command")

    subparsers.add_parser("menu", help="open the interactive menu")

    start = subparsers.add_parser("start", help="begin a purposeful coding session")
    start.add_argument("--building", "-b", help="what you are building")
    start.add_argument("--serves", "-s", help="who the work will serve")
    timer_group = start.add_mutually_exclusive_group()
    timer_group.add_argument("--timer", type=int, metavar="MINUTES", help="start a timer of this length")
    timer_group.add_argument("--no-timer", action="store_true", help="begin without a timer")

    subparsers.add_parser("debug", help="save a guided debugging session")
    subparsers.add_parser("pray", help="pray through Adoration, Confession, Thanksgiving, Supplication")
    subparsers.add_parser("reflect", help="close and reflect on the active session")
    subparsers.add_parser("stats", help="show sessions, time, streak, and reflections")

    verses = subparsers.add_parser("verses", help="browse or search the offline KJV collection")
    verses.add_argument("query", nargs="?", help="words, reference, or topic to search")
    verses.add_argument("--topic", help="browse one exact topic")

    config = subparsers.add_parser("config", help="configure Focus")
    config.add_argument("--show", action="store_true", help="show settings without changing them")
    return parser


def _pull_no_color(argv: list[str]) -> tuple[list[str], bool]:
    """Argparse only accepts global flags before subcommands; users should not need to remember that."""
    no_color = "--no-color" in argv
    return [item for item in argv if item != "--no-color"], no_color


def main(argv: list[str] | None = None) -> int:
    arguments = list(sys.argv[1:] if argv is None else argv)
    arguments, no_color = _pull_no_color(arguments)
    parser = build_parser()
    args = parser.parse_args(arguments)

    if args.command == "start" and args.timer is not None and not 1 <= args.timer <= 480:
        parser.error("--timer must be between 1 and 480 minutes")

    try:
        storage = Storage()
        console = Console(color_mode=storage.config["color"], no_color=no_color)
        for warning in storage.warnings:
            console.warning(warning)
        app = FocusApp(storage, console, ScriptureLibrary())

        if args.command in (None, "menu"):
            return app.menu()
        if args.command == "start":
            return app.start(args.building, args.serves, args.timer, args.no_timer)
        if args.command == "debug":
            return app.debug()
        if args.command == "pray":
            return app.pray()
        if args.command == "reflect":
            return app.reflect()
        if args.command == "stats":
            return app.stats()
        if args.command == "verses":
            return app.verses(args.query, args.topic)
        if args.command == "config":
            return app.config(args.show)
        parser.print_help()
        return 0
    except (KeyboardInterrupt, EOFError):
        try:
            console.write()
            console.note("Peace be with you. Anything already saved is safe.")
        except UnboundLocalError:
            print("\nFocus stopped. Anything already saved is safe.")
        return 130
    except (StorageError, RuntimeError) as exc:
        print(f"Focus could not continue: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())


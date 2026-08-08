from __future__ import annotations

import argparse
import sys

from . import __version__
from .app import RoadmapApp
from .console import Console
from .data import STAGES


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="roadmap",
        description="A curated map of resources for learning to code, beginner to professional.",
        epilog="The most important step at every level is to keep building projects.",
    )
    parser.add_argument(
        "--no-color",
        action="store_true",
        help="disable ANSI color output (also honored after a command)",
    )
    parser.add_argument("--version", action="version", version=f"Roadmap CLI {__version__}")
    subparsers = parser.add_subparsers(dest="command")

    subparsers.add_parser("menu", help="open the interactive menu")
    subparsers.add_parser("list", help="print every stage and resource")

    show = subparsers.add_parser("show", help="show resources for one stage")
    show.add_argument("stage", choices=[stage.key for stage in STAGES])

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

    console = Console(no_color=no_color)
    app = RoadmapApp(console)

    try:
        if args.command == "show":
            return app.show(args.stage)
        if args.command == "list":
            return app.list_all()
        if args.command in (None, "menu"):
            return app.menu()
        parser.print_help()
        return 0
    except (KeyboardInterrupt, EOFError):
        console.write()
        console.note("Keep building. Come back anytime.")
        return 130


if __name__ == "__main__":
    raise SystemExit(main())

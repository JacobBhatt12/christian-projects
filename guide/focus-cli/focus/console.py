from __future__ import annotations

import os
import shutil
import sys
import textwrap
from typing import Callable, Iterable, TextIO


class Console:
    """Small terminal renderer with no dependencies and predictable plain-text output."""

    RESET = "\033[0m"
    COLORS = {
        "gold": "\033[38;5;179m",
        "blue": "\033[38;5;110m",
        "green": "\033[38;5;108m",
        "red": "\033[38;5;167m",
        "muted": "\033[38;5;245m",
        "bold": "\033[1m",
    }

    def __init__(
        self,
        color_mode: str = "auto",
        no_color: bool = False,
        input_func: Callable[[], str] = input,
        out: TextIO = sys.stdout,
    ) -> None:
        self.input_func = input_func
        self.out = out
        no_color_env = "NO_COLOR" in os.environ
        if no_color or no_color_env or color_mode == "never":
            self.color = False
        elif color_mode == "always":
            self.color = True
        else:
            self.color = bool(getattr(out, "isatty", lambda: False)())

    @property
    def width(self) -> int:
        columns = shutil.get_terminal_size(fallback=(80, 24)).columns
        return max(42, min(columns - 2, 88))

    def style(self, text: str, color: str) -> str:
        if not self.color:
            return text
        return f"{self.COLORS[color]}{text}{self.RESET}"

    def write(self, text: str = "", *, end: str = "\n", flush: bool = False) -> None:
        print(text, end=end, file=self.out, flush=flush)

    def header(self, display_name: str = "") -> None:
        self.write()
        self.write(self.style("  ✦  FOCUS CLI", "gold"))
        if display_name:
            self.write(self.style(f"     Welcome, {display_name}.", "muted"))
        self.write(self.style("     Whatever you do, do it heartily, as to the Lord.", "blue"))
        self.write(self.style("     — Colossians 3:23", "muted"))
        self.write()

    def panel(self, title: str, lines: Iterable[str], color: str = "blue") -> None:
        inner_width = self.width - 4
        label = f" {title} "
        top_fill = max(0, inner_width - len(label))
        top = "╭" + label + "─" * top_fill + "╮"
        bottom = "╰" + "─" * inner_width + "╯"
        self.write(self.style(top, color))

        rendered = []
        for line in lines:
            if not line:
                rendered.append("")
                continue
            rendered.extend(
                textwrap.wrap(
                    str(line),
                    width=max(10, inner_width - 3),
                    replace_whitespace=False,
                    drop_whitespace=True,
                )
                or [""]
            )

        for line in rendered:
            padded = f"  {line}".ljust(inner_width)
            self.write(
                self.style("│", color) + padded + self.style("│", color)
            )
        self.write(self.style(bottom, color))

    def ask(self, prompt: str, default: str | None = None) -> str:
        suffix = f" [{default}]" if default not in (None, "") else ""
        self.write(self.style(f"  › {prompt}{suffix}: ", "gold"), end="", flush=True)
        answer = self.input_func().strip()
        if not answer and default is not None:
            return default
        return answer

    def ask_required(self, prompt: str) -> str:
        while True:
            answer = self.ask(prompt)
            if answer:
                return answer
            self.warning("A short answer will help this session stay meaningful.")

    def confirm(self, prompt: str, default: bool = True) -> bool:
        hint = "Y/n" if default else "y/N"
        while True:
            answer = self.ask(f"{prompt} ({hint})").lower()
            if not answer:
                return default
            if answer in {"y", "yes"}:
                return True
            if answer in {"n", "no"}:
                return False
            self.warning("Please answer yes or no.")

    def choose(self, prompt: str, options: list[str], default: str | None = None) -> str:
        lowered = {option.lower(): option for option in options}
        while True:
            answer = self.ask(f"{prompt} ({'/'.join(options)})", default).lower()
            if answer in lowered:
                return lowered[answer]
            self.warning(f"Choose one of: {', '.join(options)}.")

    def success(self, message: str) -> None:
        self.write(self.style(f"  ✓ {message}", "green"))

    def warning(self, message: str) -> None:
        self.write(self.style(f"  ! {message}", "red"))

    def note(self, message: str) -> None:
        self.write(self.style(f"  · {message}", "muted"))

    def progress_bar(self, completed: int, total: int, width: int = 24) -> str:
        ratio = 0 if total <= 0 else max(0.0, min(completed / total, 1.0))
        filled = round(width * ratio)
        return "█" * filled + "░" * (width - filled)

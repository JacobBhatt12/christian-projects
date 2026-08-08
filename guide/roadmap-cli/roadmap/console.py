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
    }

    def __init__(
        self,
        no_color: bool = False,
        input_func: Callable[[], str] = input,
        out: TextIO = sys.stdout,
    ) -> None:
        self.input_func = input_func
        self.out = out
        no_color_env = "NO_COLOR" in os.environ
        if no_color or no_color_env:
            self.color = False
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

    def header(self) -> None:
        self.write()
        self.write(self.style("  \U0001f9ed  CODE ROADMAP", "gold"))
        self.write(
            self.style("     Resources for learning to code, one stage at a time.", "blue")
        )
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
            self.write(self.style("│", color) + padded + self.style("│", color))
        self.write(self.style(bottom, color))

    def ask(self, prompt: str, default: str | None = None) -> str:
        suffix = f" [{default}]" if default not in (None, "") else ""
        self.write(self.style(f"  › {prompt}{suffix}: ", "gold"), end="", flush=True)
        answer = self.input_func().strip()
        if not answer and default is not None:
            return default
        return answer

    def success(self, message: str) -> None:
        self.write(self.style(f"  ✓ {message}", "green"))

    def warning(self, message: str) -> None:
        self.write(self.style(f"  ! {message}", "red"))

    def note(self, message: str) -> None:
        self.write(self.style(f"  · {message}", "muted"))

from __future__ import annotations

from .console import Console
from .data import CLOSING_NOTE, STAGES, Stage

STAGE_COLORS = {"beginner": "green", "intermediate": "blue", "professional": "gold"}


class RoadmapApp:
    def __init__(self, console: Console) -> None:
        self.console = console
        self.stages_by_key = {stage.key: stage for stage in STAGES}

    def show(self, key: str) -> int:
        stage = self.stages_by_key.get(key)
        if stage is None:
            self.console.warning(f"Unknown stage: {key}")
            return 1
        self.console.header()
        self._render_stage(stage)
        self.console.note(CLOSING_NOTE)
        return 0

    def list_all(self) -> int:
        self.console.header()
        for stage in STAGES:
            self._render_stage(stage)
        self.console.note(CLOSING_NOTE)
        return 0

    def menu(self) -> int:
        while True:
            self.console.header()
            for index, stage in enumerate(STAGES, start=1):
                label = f"{stage.title} — {stage.tagline}"
                self.console.write(f"  {self.console.style(str(index), 'gold')}  {label}")
            self.console.write(f"  {self.console.style('a', 'gold')}  Show everything")
            self.console.write("  q  Quit")
            self.console.write()
            choice = self.console.ask("Choose a stage").strip().lower()

            if choice in {"q", "quit", "exit"}:
                self.console.note("Keep building. Come back anytime.")
                return 0

            if choice in {"a", "all"}:
                self.console.write()
                for stage in STAGES:
                    self._render_stage(stage)
                self.console.note(CLOSING_NOTE)
            elif choice.isdigit() and 1 <= int(choice) <= len(STAGES):
                self.console.write()
                self._render_stage(STAGES[int(choice) - 1])
            else:
                self.console.warning(f"Choose 1-{len(STAGES)}, a, or q.")
                continue

            self.console.write()
            self.console.ask("Press Enter to return to the menu")

    def _render_stage(self, stage: Stage) -> None:
        lines: list[str] = []
        for resource in stage.resources:
            lines.append(f"{resource.name} — {resource.description}")
            if resource.url:
                lines.append(f"  {resource.url}")
            lines.append("")
        if lines and lines[-1] == "":
            lines.pop()
        title = f"{stage.title} · {stage.tagline}"
        self.console.panel(title, lines, color=STAGE_COLORS.get(stage.key, "blue"))

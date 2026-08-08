from __future__ import annotations

import time
from typing import Callable

from .console import Console


def format_duration(seconds: int) -> str:
    seconds = max(0, int(seconds))
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours}h {minutes:02d}m"
    if minutes:
        return f"{minutes}m {secs:02d}s"
    return f"{secs}s"


def run_focus_timer(
    minutes: int,
    console: Console,
    *,
    monotonic: Callable[[], float] = time.monotonic,
    sleep: Callable[[float], None] = time.sleep,
) -> tuple[int, bool]:
    total_seconds = max(1, int(minutes * 60))
    started = monotonic()
    completed = False
    console.write()
    console.note("Focus gently. Press Ctrl+C to stop the timer early; your session will remain saved.")

    try:
        while True:
            elapsed = min(total_seconds, int(monotonic() - started))
            remaining = total_seconds - elapsed
            bar = console.progress_bar(elapsed, total_seconds, width=28)
            console.write(
                f"\r  {console.style(bar, 'green')}  {format_duration(remaining)} remaining",
                end="",
                flush=True,
            )
            if remaining <= 0:
                completed = True
                break
            sleep(min(1.0, remaining))
    except KeyboardInterrupt:
        elapsed = min(total_seconds, max(0, int(monotonic() - started)))
        console.write()
        console.note("Timer stopped. No guilt, no lost notes—return when you are able.")
        return elapsed, False

    console.write()
    console.success("Focus block complete. Take a breath before the next thing.")
    return total_seconds, completed


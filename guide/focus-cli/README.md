# Focus CLI

**A terminal companion for Christian developers who want to work with purpose, pray honestly, and close the laptop thoughtfully.**

> “Whatever you do, do it heartily, as to the Lord.” — Colossians 3:23

Focus helps you name what you are building and whom it serves, focus for a while, work through bugs without panic, and reflect before moving on. It is intentionally local and quiet: no account, telemetry, web server, external API, or third-party runtime package.

Productivity does not earn God’s favor. Focus treats useful work as a grateful response to grace, not a spiritual scorecard. The stats are a memory aid—not a measure of faithfulness, identity, or worth.

## What it does

- `focus start` — name the work and its beneficiary, read a relevant KJV passage, and optionally start a focus timer.
- `focus debug` — capture expected and actual behavior, recent changes, attempted fixes, and a practical debugging checklist.
- `focus pray` — move through Adoration, Confession, Thanksgiving, and Supplication; save or discard the notes.
- `focus reflect` — close the active session and record what was completed, learned, still needs help, and served others.
- `focus stats` — see sessions, focus and coding time, current streak, completed projects, and recent reflections.
- `focus verses` — browse or search 30 offline public-domain KJV passages across wisdom, perseverance, anxiety, excellence, humility, rest, service, and grace.
- `focus config` — set a display name, color behavior, timer length, and data directory.
- `focus` — open the interactive menu when no command is given.

The terminal UI uses restrained ANSI color, Unicode borders, and progress bars. It respects [`NO_COLOR`](https://no-color.org/) and also accepts `--no-color` before or after a command.

## Requirements

- Python 3.9 or newer
- macOS, Linux, or Windows

Focus itself uses only the Python standard library. `pip`/setuptools are needed only if you choose to install the `focus` command; running from source needs nothing else.

## Run from source

```console
$ cd guide/focus-cli
$ python3 -m focus
```

On Windows, use the Python launcher:

```console
> cd guide\focus-cli
> py -3 -m focus
```

There are also repository launchers:

```console
$ ./bin/focus stats
```

```console
> focus.cmd stats
```

## Install the `focus` command

From this directory:

```console
$ python3 -m pip install --user .
$ focus start
```

On Windows:

```console
> py -3 -m pip install --user .
> focus start
```

If your shell cannot find `focus` after a user install, add Python’s user scripts directory to `PATH`, or keep using `python -m focus` / `py -3 -m focus`.

## Command examples

```console
# Interactive menu
$ focus

# Normal guided start
$ focus start

# Supply context up front and skip the timer
$ focus start --building "a church volunteer rota" --serves "ministry leaders" --no-timer

# Use a one-hour timer instead of the configured default
$ focus start --timer 60

# Close the active session
$ focus reflect

# Work through a bug or pray through ACTS
$ focus debug
$ focus pray

# Search the offline KJV collection
$ focus verses anxiety
$ focus verses "careth for you"
$ focus verses --topic wisdom

# Plain output for a log file or accessibility tool
$ focus stats --no-color
$ NO_COLOR=1 focus stats

# Inspect settings without editing them
$ focus config --show
```

Timer lengths must be whole minutes from 1 to 480. Pressing Ctrl+C during a timer stops only the timer and preserves the open session. Pressing Ctrl+C elsewhere exits with a short message; anything already saved remains safe.

## Local data and privacy

Focus writes two human-readable JSON files:

| Platform | Configuration | Default data |
| --- | --- | --- |
| macOS / Linux | `~/.config/focus/config.json` | `~/.local/share/focus/focus-data.json` |
| Windows | `%APPDATA%\Focus\config.json` | `%LOCALAPPDATA%\Focus\focus-data.json` |

`XDG_CONFIG_HOME` and `XDG_DATA_HOME` are honored on macOS/Linux. `FOCUS_HOME` puts configuration and data beneath one chosen directory, which is useful for portable use and automated tests:

```console
$ FOCUS_HOME=/path/to/private-folder focus stats
```

Changing the data directory through `focus config` copies current data when the destination is empty. If a Focus data file is already there, the CLI asks before switching to it. The old file is left in place, so moving data is recoverable.

Prayer notes are private only in the sense that they never leave the machine through Focus. The JSON is **not encrypted**. Choose a protected data directory, discard sensitive notes, or use operating-system disk encryption when appropriate.

Writes use a temporary file followed by an atomic replace, which avoids half-written JSON if a process is interrupted. Invalid JSON is moved aside with a `.corrupt-<timestamp>` suffix before safe defaults are loaded.

## Development and tests

Run the complete standard-library test suite:

```console
$ python3 -m unittest discover -s tests -v
```

The tests cover persistence and corruption recovery, data-directory changes, Scripture topics and search, starting and reflecting, timers, debugging notes, prayer-note save/discard behavior, streaks and stats, `NO_COLOR`, and a subprocess CLI smoke test.

Project layout:

```text
focus-cli/
├── bin/focus                 executable source-tree launcher
├── run_focus.py              cross-platform Python entry script
├── focus.cmd                 Windows source-tree launcher
├── focus/
│   ├── app.py                  session, debug, prayer, stats, and config flows
│   ├── cli.py                  argument parsing and command dispatch
│   ├── console.py              prompts, colors, borders, and progress bars
│   ├── focus_timer.py          interruptible terminal timer
│   ├── scripture.py            offline search and session selection
│   ├── storage.py              JSON paths, validation, and atomic saves
│   └── data/verses.json        curated public-domain KJV passages
├── tests/
├── docs/example-session.md
└── pyproject.toml
```

## Intentional choices

- **One active session.** Starting another session is refused until the current one is reflected on. This keeps elapsed time and reflection ownership clear without building a task manager.
- **Two kinds of time.** Coding time is the wall-clock span from start to reflection. Focus time is the completed/stopped timer when one was used; without a timer, the session span is used. Stats show both.
- **A forgiving streak.** A streak remains current when the latest session was today or yesterday, so opening the CLI before today’s work does not show a broken streak.
- **No spiritual gamification.** There are no points, rankings, guilt messages, or claims that output earns approval from God.
- **Straightforward modules.** The project is small enough that command workflows live together in `app.py`; persistence, terminal rendering, timing, and Scripture lookup are split only where they have genuinely different responsibilities.

The included Scripture text is from the King James Version, which is public domain in the United States. Users elsewhere should consider local Crown rights that may apply to the Authorized Version.

See [the full example session](docs/example-session.md) for an end-to-end terminal transcript.

## License

MIT. See [LICENSE](LICENSE).

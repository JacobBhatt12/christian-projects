# Roadmap CLI

**A terminal-only, curated map of resources for learning to code — beginner through professional.**

Roadmap doesn't teach you to code itself. It points you to a short, deliberately
small list of resources at each stage, so you spend your time building instead
of searching for "best resources to learn programming."

## What it does

- `roadmap` — open the interactive menu and pick a stage to browse.
- `roadmap show <stage>` — print resources for one stage (`beginner`, `intermediate`, or `professional`).
- `roadmap list` — print every stage, useful for piping to a file or a pager.

## Requirements

- Python 3.9 or newer
- macOS, Linux, or Windows

Roadmap uses only the Python standard library — nothing to install to run it from source.

## Run from source

```console
$ cd guide/roadmap-cli
$ python3 -m roadmap
```

On Windows, use the Python launcher:

```console
> cd guide\roadmap-cli
> py -3 -m roadmap
```

There are also repository launchers:

```console
$ ./bin/roadmap show beginner
```

```console
> roadmap.cmd show beginner
```

## Install the `roadmap` command

From this directory:

```console
$ python3 -m pip install --user .
$ roadmap
```

If your shell can't find `roadmap` after a user install, add Python's user
scripts directory to `PATH`, or keep using `python -m roadmap`.

## Command examples

```console
# Interactive menu
$ roadmap

# One stage at a time
$ roadmap show beginner
$ roadmap show intermediate
$ roadmap show professional

# Everything, plain text (good for piping or reading on a small terminal)
$ roadmap list --no-color
$ NO_COLOR=1 roadmap list
```

## The roadmap

**Beginner** — freeCodeCamp, CS50x, MDN Learn, GitHub Skills.
**Intermediate** — The Odin Project, Exercism, Full Stack Open, and building
projects without following a tutorial step by step.
**Professional** — reading official documentation, studying data structures,
algorithms, system design, testing, security, and performance; contributing
to open source; shipping complete applications real people use; and giving
and receiving code review.

The full descriptions and links live in [`roadmap/data.py`](roadmap/data.py) —
that's the one file to edit to add, reorder, or update a resource.

At every stage, the same closing line applies: **keep building projects.**
Reading about code and writing code are different skills, and only one of
them ships software.

## Development and tests

```console
$ python3 -m unittest discover -s tests -v
```

Project layout:

```text
roadmap-cli/
├── bin/roadmap                executable source-tree launcher
├── run_roadmap.py             cross-platform Python entry script
├── roadmap.cmd                Windows source-tree launcher
├── roadmap/
│   ├── app.py                   menu, show, and list commands
│   ├── cli.py                   argument parsing and command dispatch
│   ├── console.py                prompts, colors, and panel borders
│   └── data.py                  the curated stages and resources
├── tests/
├── docs/example-session.md
└── pyproject.toml
```

## License

MIT. See [LICENSE](LICENSE).

# FaithOS for Coders for Christ

FaithOS is a small, purpose-centered command center for Christian developers. It brings a daily Scripture, a prayer timer, a private gratitude journal, and a bite-sized coding mission into one polished terminal app.

It is intentionally a single readable Python file, so beginners can see how every part works and make it their own.

## What is inside

- A cinematic boot sequence with compact FAITHOS art
- A rotating daily Bible verse (KJV)
- An interactive prayer timer with presets and a custom duration
- A gratitude journal stored locally as readable JSON
- A practical “Mission for Today” coding challenge
- A clean number-key menu built for small terminal windows
- A self-running 15–20 second demo for social video

## Setup

Open a terminal in this folder. A virtual environment keeps the one dependency
separate from the rest of your computer (and is required by newer Homebrew
Python installs on macOS):

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Then install and run FaithOS with the requested commands:

```bash
pip install -r requirements.txt
python faithos.py
```

If your computer uses `python3` and `pip3`, use:

```bash
pip3 install -r requirements.txt
python3 faithos.py
```

On Windows, activate the virtual environment with `.venv\Scripts\activate`
instead of the `source` command.

## Record the Reel demo

Make the terminal about 60 columns wide, increase the font size, and run:

```bash
python faithos.py --demo
```

The tour runs by itself and ends on:

```text
CODE WITH PURPOSE.
CREATE FOR THE KINGDOM.

CODERS FOR CHRIST
```

The demo previews a gratitude entry but does not write it to your journal.

## Using FaithOS

Choose a feature with its number and press Enter. In the prayer timer, press `Ctrl+C` if you need to end a session early. To skip the boot animation during everyday use:

```bash
python faithos.py --skip-boot
```

Your gratitude entries are saved in `gratitude_journal.json` in this folder. That file is created after your first entry and never leaves your computer.

## Make it yours

Open `faithos.py` and look near the top of the file:

- Add or change entries in `VERSES`.
- Add a new challenge to `MISSIONS`.
- Adjust `GREEN`, `CYAN`, `GOLD`, or the animation delays.
- Change `JOURNAL_FILE` if you want to store the journal somewhere else.

No database, account, API key, or internet connection is required.

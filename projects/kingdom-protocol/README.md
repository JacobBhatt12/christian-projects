# Kingdom Protocol

Kingdom Protocol is a cinematic, fictional terminal for digital missionaries. It boots like a secure network access sequence — animated system logs, identity checks, and a scrambled "ACCESS GRANTED" — then drops you into a fully interactive command line themed around Scripture, prayer, and everyday mission.

Nothing here performs real hacking, scanning, or intrusion of any kind. Every "system" is fictional. Every verse is real Scripture, and every mission is a real, harmless act of kindness you can actually go do.

## Commands

- `help` — list available commands
- `verse` — reveal a random Bible verse
- `mission` — generate a real-world act of kindness
- `pray` — open a guided ACTS prayer prompt
- `armor` — display your Armor of God status (Ephesians 6)
- `journal write/list/clear` — a private faith journal, saved only in your browser
- `testimony` — read an encouraging testimony from the field
- `clear` — clear the terminal
- `reboot` — replay the boot sequence
- `about` — what this project is and isn't
- `easteregg` — unlock a hidden visual sequence

There's also a hidden command, not listed in `help`, that dramatically transforms the whole theme while revealing Genesis 1:3.

## Privacy

Journal entries, sound and theme preferences, and command history are stored only in the browser's `localStorage`, under keys prefixed `kp:`. Nothing is uploaded, tracked, or shared.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Open the local address printed in the terminal.

## Build and verify

```bash
npm run build
npm run lint
```

## Technology

- React 19 and TypeScript
- Vite
- Tailwind CSS 4, with the CRT/terminal visual system in `src/index.css`
- `localStorage` for private on-device persistence, no server or account
- Web Audio API for synthesized (no audio files) keypress and chime sounds
- Oxlint for linting

King James Version Scripture quotations are public domain in the United States.

# Detour

Detour is a private, responsive browser app that helps Christians interrupt temptation and choose a faithful next step through a three-part reset: Pause, Pray, Pivot.

## Run locally

Detour has no dependencies or build step. From this directory, start any static file server:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Features

- 30-second breathing timer with changing instructions and an early-continue option
- Struggle-specific public-domain KJV Scripture and compassionate prayers
- Five practical Pivot actions and a three-action Quick Exit
- Locally saved total-reset count and daily streak
- Reset button and Escape-key shortcut
- Responsive desktop and mobile layouts
- Semantic HTML, native keyboard navigation, visible focus states, high contrast, and reduced-motion support

## Privacy and storage

Detour has no accounts, backend, analytics, cookies, or external requests. It stores only three progress values in `localStorage` under `detour.stats.v1`:

- total completed resets
- current daily streak
- date of the last completed reset

The selected struggle and escape action are kept in memory only for the current session and are not saved.

## Project files

- `index.html`: semantic app shell
- `styles.css`: responsive monochrome interface and accessibility states
- `app.js`: guided flow, timer, Quick Exit, keyboard behavior, and local statistics
- `README.md`: setup and project notes

## Browser support

Use a current version of Chrome, Edge, Firefox, or Safari. The app relies on standard browser features only.

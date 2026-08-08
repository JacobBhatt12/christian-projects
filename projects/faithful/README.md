# Faithful

Faithful is a private daily discipleship planner that helps Christians move from reading Scripture to one practical response. It is a static project built with HTML, CSS, vanilla JavaScript, and JSON.

## Features

- One daily passage from a local JSON file
- Notes for what the passage teaches
- One practical commitment in one of three daily areas
- Grace-centered evening reflection
- Private prayer list with answered-prayer tracking
- Seven-day history without scores or streaks
- Plain-text reflection export
- Automatic browser storage

No account is required. No personal information is transmitted or uploaded. Entries remain in the current browser's `localStorage` until that site data is cleared.

## Run locally

Because the passage is loaded from `content.json`, open the project through a small local web server instead of double-clicking `index.html`.

From this folder, run:

```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

You can also use any editor extension that serves static files. No installation, package manager, build command, or internet connection is needed.

## Files

- `index.html`: semantic page structure and accessible forms
- `styles.css`: responsive black-and-white visual system
- `app.js`: navigation, local saving, prayer tracking, history, and export
- `content.json`: daily Scripture passages from the public-domain World English Bible
- `README.md`: setup and project notes

`PRODUCT.md` and `DESIGN.md` document the product and visual decisions for future maintenance.

## Editing the passages

Add or change entries in `content.json`. Each passage needs a unique `id`, a `reference`, and `text`. Faithful rotates through the available passages by day of year and keeps the chosen passage stable for that saved day.

## Browser support

Faithful uses modern browser features such as `fetch`, `localStorage`, `Blob`, and `Intl.DateTimeFormat`. Current versions of Chrome, Edge, Firefox, and Safari are supported.

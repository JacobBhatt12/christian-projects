# Bread & Light

Bread & Light is a private, offline app that turns the time a person honestly has into one concrete act of Christian service. Choose 15 minutes, one hour, or one afternoon; receive a randomly selected idea; commit to it; and return later to record what happened and what you learned.

The app includes 300 service ideas, 100 for each time category. It has no account, server, database, analytics, cloud sync, or social features.

## Privacy

Reflections are saved in the app’s local browser storage under the versioned key `bread-and-light:reflections:v1`. They remain on the current device and are never uploaded. Clearing the app’s saved data removes the reflections, so copy anything you want to preserve before clearing application data.

## Install

Requirements: a current Node.js release and npm. On macOS packaging requires macOS.

```bash
npm install
```

## Run in a browser

Start Vite’s development server:

```bash
npm run dev
```

Open the local address printed in the terminal.

## Run as an Electron desktop app

Build the renderer and open it in Electron:

```bash
npm run desktop
```

## Build and verify

Create the production renderer in `dist`:

```bash
npm run build
```

Run the linter and data tests:

```bash
npm run lint
npm test
```

Run the browser acceptance flow and capture desktop and mobile screenshots in `artifacts`:

```bash
npm run verify:ui
```

## Package the macOS app

Create a double-clickable native app for the current Mac architecture:

```bash
npm run package:desktop
```

On Apple Silicon, open the packaged app with:

```bash
open "release/Bread & Light-darwin-arm64/Bread & Light.app"
```

The package uses ASAR, excludes development source where practical, prunes development dependencies, and is written to `release`.

## Technology

- React 19 and TypeScript
- Vite
- Tailwind CSS 4, with the visual system implemented in `src/index.css`
- Electron with context isolation, renderer sandboxing, blocked in-app navigation, and a restrictive production Content Security Policy
- `localStorage` for private on-device persistence
- Electron Packager for native packaging
- Oxlint, Vitest, and Playwright for verification

King James Version Scripture quotations are public domain in the United States.

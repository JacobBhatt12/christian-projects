# GoodWorks

A complete local impact reporting application for small nonprofits, churches, and Christian ministries. The application opens directly to its dashboard. No server account, authentication, API key, or paid service is needed.

## Run locally

Requires Node.js 22.12 or newer and npm.

```sh
cd projects/goodworks
npm install
npm run dev
```

Open the URL Vite prints, normally **http://localhost:5173**. Use the same browser and URL each time: IndexedDB data belongs to that browser profile and origin (including the port).

```sh
npm run build          # TypeScript checking and production bundle
npm run preview        # Serve the production bundle locally
npm test               # 14 focused unit tests
npm run test:e2e       # Eight browser checks, including themes and loading; requires Google Chrome
```

The Playwright tests launch isolated Chrome profiles and do not alter the workspace in your normal browser. They cover activity creation/editing/deletion, counting, draft exclusion, participant validation, volunteers becoming inactive, supply units, report snapshots and refresh, CSV downloads, reload persistence, validated backup/restore, filter consistency, print/PDF generation, and mobile navigation.

## Appearance

Use **Appearance** in the top bar to choose **Light**, **Dark**, or **System**. System follows your device preference and updates when it changes. A manual choice is remembered in this browser and synchronized across tabs. Reports always print on a light background.

## Motion and loading

GSAP animates the dashboard entrance and loading text. The first dashboard visit after each page load shows a centered, full-screen “Loading your dashboard” message for three seconds. The subtitle cycles through Activities, Supplies, and Logs for one second each. It waits longer if the dashboard code is still loading. Returning to the dashboard within the same session is immediate. Animations are cleaned up on navigation and disabled when the device requests reduced motion.

## Included workflows

- **Dashboard:** month or custom date range, program filtering, computed impact metrics, attendance and volunteer charts, grouped supplies, recent activities.
- **Activities:** search, sortable columns, date/program/status filters, pagination, CSV export, and a tabbed create/edit dialog for attendance, hours, and supply distributions. Deletion confirms that related contributions and distributions will be removed.
- **People Served:** reusable anonymous participant IDs, first and latest completed attendance, filtered visit counts, and attendance history. New IDs can be generated while logging an activity. Names and contact details are not collected.
- **Volunteers:** create/edit display names, deactivate/reactivate, filtered hours and activity counts, and contribution history. Inactive volunteers retain all historical contributions.
- **Supplies:** completed distribution records and period totals grouped by item and unit. Edit a linked activity to correct a distribution. This is not an inventory system.
- **Reports:** choose one or multiple programs and a period, preview computed results, edit narratives, save/reopen drafts, refresh figures explicitly, export CSV, and print or save as PDF. No participant-level records appear in donor-facing report exports.
- **Settings:** organization details, add/rename/archive/reactivate programs, JSON backup/validated restore, reload fictional samples, or start an empty workspace.

The sample workspace is explicitly fictional and contains four months of relative-date activities, repeat participants across programs, anonymous attendance, volunteer hours, and multiple supply units. It is seeded only when no workspace exists. Deleting samples or starting empty does not reseed on reload.

## Counting rules

Only completed activities contribute to impact metrics. Date ranges include both boundaries.

- **Unique identified participants:** distinct IDs across the entire selected period and all selected programs.
- **Identified service visits:** one attendance per participant per activity.
- **Additional repeat visits:** identified visits minus unique identified participants.
- **Anonymous attendance:** visits without participant IDs, which cannot be deduplicated.
- **Total service visits:** identified visits plus anonymous attendance.

A person attending three activities contributes one unique participant, three identified visits, and two additional repeat visits. Anonymous attendance never increases the unique total. Annual and organization-wide uniques are calculated from IDs, never by adding monthly or program unique totals. Supplies with different units stay separate.

## Report snapshots

Drafts store aggregate figures, program names, organization name, reporting scope, generation timestamp, and narratives. Changes to activities do not silently alter saved drafts. **Refresh figures** recomputes the snapshot from current records; manually edited narratives remain intact. An untouched generated summary is regenerated to match the new numbers. Review any manually edited numeric claims after refreshing. Save again to persist the updated snapshot.

**Print / PDF** opens the browser print dialog. Choose Save as PDF, and disable browser-added headers and footers if desired. Print CSS removes application navigation, controls, and empty optional narrative sections. Long reports paginate naturally.

CSV exports quote every cell, escape embedded quotes and newlines, and neutralize leading spreadsheet formulas. Report CSVs include metrics, program breakdowns, supply totals, scope, timestamp, and methodology; the printable report includes narratives as well.

## Local data and limitations

Records are stored in IndexedDB through Dexie. There is no cloud sync, staff sharing, login, server backup, analytics, or AI generation. Clearing site data or losing the browser profile can remove records. Keep regular JSON backups; backup files include all records, including anonymous participant IDs and volunteer display names.

Restore validates the schema, dates, numerical constraints, duplicate record IDs, and activity references before asking for confirmation. Replacement uses one atomic IndexedDB write. Concurrent stale writes from another tab are rejected to prevent overwriting newer records; reload before editing in that tab. Prefer one editing tab at a time.

Browser storage limits apply. The app is designed for modest local datasets, not millions of records. It has no installed offline/PWA cache: the Vite or production web server must serve the application, although no backend is needed for its data. Exports and backups are downloaded through the browser.

## Implementation

React + TypeScript + Vite, Tailwind CSS, shadcn-style accessible Radix dialog/button components, Lucide icons from the [21st.dev collection](https://21st.dev/community/icons/lucide), Recharts, React Router, Dexie, and Zod. The Zenith admin dashboard was inspected for layout inspiration; no proprietary code or assets are used.

- `src/model.ts`: schemas, filtering, aggregation, snapshots, CSV serialization.
- `src/db.ts`: IndexedDB persistence, first-launch seeding, concurrent-write protection.
- `src/App.tsx`: navigation, local workspace state, saving/error feedback.
- `src/ActivityForm.tsx`: validated activity editor.
- `src/Dashboard.tsx`, `Records.tsx`, `Reports.tsx`, `Settings.tsx`: application views.
- `src/styles.css`: responsive shell, components, and print styles.
- `src/model.test.ts`, `tests/workflows.spec.ts`: focused unit and browser tests.

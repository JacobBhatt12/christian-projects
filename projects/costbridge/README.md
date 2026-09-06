# CostBridge

CostBridge is a mobile-first Next.js application for comparing lower-cost alternatives for essential expenses and finding community assistance by ZIP code. Public search requires no account and never requests precise location.

The repository includes 24 clearly labeled sample assistance resources and 24 sample alternatives. It works locally without a Supabase account or paid API. When Supabase environment variables are present, the same API layer uses Supabase instead.

> Development records are fictional and visibly labeled **Sample data**. Do not use them to plan a real visit, purchase, or application.

## Features

- Guided search across groceries, housing, utilities, transportation, healthcare, childcare, clothing, internet, and phone service
- ZIP-based estimated distance without browser geolocation
- Price and unit-price comparisons with tested monthly-savings calculations
- Filters for free, discounted, transit-accessible, and online options
- Sorting by price, distance, and estimated savings
- Detailed assistance listings with hours, services, eligibility, documents, languages, application steps, and information date
- Browser-bound saved items, Web Share or copy-link fallback, and print layouts
- Server-validated and sanitized resource suggestions
- Password-protected admin review, editing, approval, publication, and verification records
- Supabase schema, indexes, row-level security, and seed SQL
- Loading, empty, validation, not-found, and error states

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer
- Optional: a free Supabase project and Supabase CLI

## Installation

```bash
cd projects/costbridge
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment values are required for local development. Without Supabase configuration, public search reads the TypeScript seed files and mutations are persisted to `.local-data/costbridge.json`. That directory is gitignored.

For the local admin dashboard, use `costbridge-local-admin` when `ADMIN_PASSWORD` is blank. This fallback is disabled automatically in production.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL used for published search data and public submissions |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anonymous key, protected by row-level security |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for Supabase admin and saved items | Server-only key used by the protected repository layer. Never expose it to the browser. |
| `ADMIN_PASSWORD` | Required in production | Password for the reviewer dashboard |
| `ADMIN_SESSION_SECRET` | Recommended | Separate secret used to derive the HTTP-only admin session cookie |

Copy `.env.example` to `.env.local` and add values there. Do not commit `.env.local` or the service-role key.

## Database setup

### Supabase CLI

1. Create a Supabase project or start local Supabase.
2. Link the project if needed: `supabase link --project-ref YOUR_PROJECT_REF`.
3. Apply the schema: `supabase db push`.
4. Load development data with the SQL editor or `psql` using `supabase/seed.sql`.
5. Add the project URL, anonymous key, and service-role key to `.env.local`.
6. Restart `npm run dev`.

The schema is in `supabase/migrations/001_costbridge_schema.sql`. It creates these requested models as tables:

- `categories` (`Category`)
- `locations` (`Location`)
- `assistance_resources` (`AssistanceResource`)
- `alternatives` (`Alternative`)
- `resource_submissions` (`ResourceSubmission`)
- `verification_records` (`VerificationRecord`)
- `saved_items` (`SavedItem`)

Public row-level security allows reading only published resources and alternatives. Anonymous users can insert a pending submission but cannot read submission contact information. Saved items, review data, and admin mutations are available only through server routes using the service-role key and the admin session.

### Supabase SQL editor

If you are not using the CLI, run these files in order:

1. `supabase/migrations/001_costbridge_schema.sql`
2. `supabase/seed.sql`

The seed is idempotent for the sample records and keeps them marked `is_sample = true` with `verification_status = 'sample'`.

## Tests and quality checks

```bash
npm test
npm run test:coverage
npm run lint
npm run typecheck
npm run build
```

Vitest covers search matching, category fallback, filters, distance limits, sort order, unit prices, monthly savings, input sanitization, validation, and seed counts.

## How suggestions and updates work

### Residents and organizations

1. Open `/suggest`.
2. Provide public program information and private reviewer contact details.
3. Confirm the accuracy attestation and submit.
4. The record is stored as `pending` and is not public.

Submitting does not guarantee publication or verification. Contact details are used only by reviewers and are not returned by public routes.

### Reviewers

1. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in production.
2. Open `/admin` and sign in.
3. Review and edit the organization name, description, hours, and eligibility wording.
4. Choose `Approve and publish as unverified`, request changes, reject, or leave pending.
5. Verify a published resource only after contacting the organization or checking an authoritative source. Record the method and notes.

In both local and Supabase modes, approval creates a published assistance resource labeled **Not yet verified**. Verification is a separate action that creates a dated `verification_records` entry and updates the resource freshness fields. A production team should still add duplicate detection and let a data steward merge an approved suggestion into an existing canonical listing when appropriate.

An organization that needs to correct a listing can submit the resource again with the corrected information and explain the update in the description or contact a future site administrator. A production release should add signed organization ownership and a dedicated “claim this listing” workflow before accepting direct edits.

## Privacy and safety choices

- Search uses a 5-digit ZIP code only. Browser geolocation is never requested.
- Search does not require a user account.
- Saved items use a random browser identifier. They do not contain a name or email.
- Submission inputs are length-limited, validated with Zod, stripped of HTML tags and control characters, and written only through server routes.
- The admin cookie is HTTP-only, SameSite strict, and secure in production.
- CostBridge never states that a person qualifies for a program.
- Every result includes sample or verification status and an information date.

Before a public launch, add infrastructure-level rate limiting, email verification for submitters, audit logging, a managed admin identity provider, monitoring, and a formal privacy policy.

## Project structure

```text
app/
  api/                 Route handlers for search, saves, submissions, and admin
  admin/               Review and verification dashboard
  resources/[id]/      Assistance resource details
  results/             Search results and loading/error boundaries
  saved/               Browser-bound saved results
  search/              Guided public search
  suggest/             Resource suggestion workflow
components/            Accessible UI, forms, result rows, and actions
lib/
  data/                Bundled TypeScript development seeds
  server/              Supabase/local repository and admin session helpers
  location.ts          ZIP coordinate and distance estimates
  savings.ts           Unit-price and savings calculations
  search.ts            Matching, filtering, and sorting
  validation.ts        Zod schemas and input normalization
supabase/
  migrations/          Database schema, indexes, triggers, and RLS
  seed.sql             24 sample resources and 24 sample alternatives
tests/                 Search, filters, savings, and submission tests
```

## Future verified public-data integrations

The MVP deliberately avoids paid APIs. Future integrations should use scheduled imports into a review queue, not publish external data automatically.

- 211 and local community information exchanges, where licensing permits
- HUD resource locators and Continuum of Care directories
- HHS health center data and state clinic directories
- USDA food-access and nutrition-program datasets
- State LIHEAP, childcare subsidy, and utility commission directories
- GTFS feeds for public transportation accessibility and trip estimates
- FCC broadband and Lifeline provider information
- Municipal open-data portals and library resource catalogs

Each integration should store source URL, license, import date, field-level provenance, and a human verification record. Automated checks can flag stale phone numbers, broken websites, and old verification dates, but a program should be labeled verified only after a documented human or authoritative-source check.

# AI60 - Mission 500

A working NxtWave growth-challenge simulation: a concrete project offer, optional three-question matching, direct workshop registration, optional squads, and an editable seven-day acquisition model.

## Run

```sh
npm ci
npm run dev
```

For a production build:

```sh
npm run lint
npm run typecheck
npm test
npm run build -- --webpack
npm start
```

Open `/` and use the visible navigation. `/submission` contains the evaluator walkthrough, two-page plan, learning notes, captioned video, and narration script. `/dashboard` contains the campaign simulator and measurements. `/admin` also exposes demo reset.

## Explicit modes

Without server database configuration, the app runs in SIMULATION mode. Registration validates the contact fields but does not retain email or phone. Demo builders and squads live in process memory and expire on restart; this mode is for a single-instance walkthrough, not production persistence. The dashboard's illustrative scenario remains fixed and is labeled separately from test activity.

With the database configured, writes are LIVE and errors fail closed. No fake success and no hybrid seeded/live totals. The real workshop date and organizer contact have not been supplied. The current project is a challenge prototype, not an official NxtWave enrollment service.

## Live configuration and migration

Copy `.env.example` into `.env.local`. Never use NEXT_PUBLIC variables for signing keys or service-role credentials.

1. On a staging Supabase project, apply `src/lib/supabase/schema.sql` if starting fresh.
2. Run `supabase/preflight.sql`; reconcile existing duplicates deliberately. No automatic data deletion is included.
3. Apply `supabase/migrations/20261004_integrity.sql` once. It adds unique constraints, builder sequence, transactional registration, and locked squad joins. SQL functions are callable only by service_role.
4. Set `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a random `SESSION_SECRET` of at least 32 characters. Keep the secret stable across instances.
5. Verify database transactions and concurrent joins using your staging credentials. Session cookies are HttpOnly, SameSite=Lax, Secure under production.
6. Before collecting real people, supply organizer contact, event schedule, retention/deletion procedures, and a shared edge rate limiter. The included rate limiter is per process only.

Signed sessions authorize squad writes. Client-supplied user IDs are ignored. Email uniqueness prevents duplicate live registration; recovering a session from an email alone is intentionally unsupported because email verification has not been implemented.

## Growth model

Baseline: 20 campus contacts × 50 unique visits × 30% conversion = 300. Community visitors: 500 × 25% = 125. One referral generation: 425 × 30% participation × 2 delivered invites × 29.42% conversion ≈ 75. Total 500. These values are hypotheses, not actual results.

At 20% campus conversion the forecast is 382. The simulator exposes channel overlap, reach, conversion, invitations, uncommitted budget, and conservative recovery estimates. The maximum budget allocation is INR 2,000.

Unique analytics stages are counted by anonymous browser ID. Direct registration bypasses the matcher. Referral contribution is attributed registrations / other registrations; it is not viral K. Share actions do not verify invitation delivery. Database reads are paginated beyond Supabase's default row limit.

## Validation

Browser tests: `npx playwright install chromium`, then `npm run test:browser`. A preinstalled binary can be supplied through BROWSER_EXECUTABLE_PATH. `npm run test:failure` injects a configured database outage and verifies that it fails closed. The tests launch their own production server.

`npm test` checks forecast arithmetic, bounds, overlap, deduplication, consistent metrics, and guidance for experienced students. Run `npm run test:integration` to exercise requests, validation, session authorization, duplicate joins, and concurrent capacity in simulation. These tests do not claim that the live migration has been executed.

See `docs/Audit-Completion-Report.md` for the full implementation-to-audit mapping and remaining deployment gates. A captioned three-minute video and narration script are supplied. Personal narration is optional.

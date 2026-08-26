# Umoja SACCO Manager

A full-stack app for running a SACCO's day-to-day work: member records, savings
& shares, and loans — with a back-office view for staff and a self-service
portal for members.

## What it does

**Staff / Admin back office**
- Register members (auto-opens a Shares and a Savings account for each)
- Record deposits and withdrawals against any member's account, with a running ledger
- Review loan applications, set the interest rate, approve & disburse (or reject with a reason)
- Record loan repayments; loans auto-close when fully repaid
- Dashboard overview: total members, total savings & shares, active loans, outstanding balance, pending applications

**Member self-service portal**
- View savings/shares balances and full transaction history
- Apply for a loan
- Track loan status and repayment history

**Accounts & roles**
- `ADMIN` / `STAFF` — back office (`/dashboard`)
- `MEMBER` — self-service portal (`/portal`), tied to one member record

## Tech stack

- **Next.js 16** (App Router, Server Actions, TypeScript)
- **Drizzle ORM** + **SQLite** (via `better-sqlite3`) — swap to Postgres for multi-instance production hosting (see below)
- **Custom JWT auth** (httpOnly cookies via `jose`) + `bcryptjs` for password hashing — no third-party auth service required
- **Tailwind CSS v4** — hand-built design system (no external font downloads, so it builds reliably in locked-down/offline environments)

## Getting started locally

```bash
npm install
cp .env.example .env.local     # then edit AUTH_SECRET (see below)
npm run db:migrate             # creates sacco.db and applies the schema
npm run db:seed                # optional: adds demo staff, members, and loans
npm run dev
```

Visit `http://localhost:3000`.

**Demo logins after seeding:**
| Role   | Email               | Password   |
|--------|---------------------|------------|
| Admin  | admin@sacco.coop    | admin123   |
| Staff  | staff@sacco.coop    | staff123   |
| Member | jane@example.com    | member123  |

**Change these before going live** — the seed script is for trying the app out, not for production accounts. Create real staff/admin logins from the database directly, or build an admin "create staff user" screen before deploying (see Next steps).

## Environment variables

| Variable        | Required | Purpose                                                             |
|-----------------|----------|----------------------------------------------------------------------|
| `AUTH_SECRET`   | Yes      | Signs session JWTs. Generate one with `openssl rand -base64 32`.    |
| `DATABASE_PATH` | No       | Path to the SQLite file. Defaults to `./sacco.db`.                  |

## Data model

`members` → `savingsAccounts` (Shares, Savings) → `savingsTransactions`
`members` → `loans` → `loanRepayments`
`users` (login accounts) optionally link to a `member` via `memberId`, and carry a `role` of `ADMIN`, `STAFF`, or `MEMBER`.

Loan interest uses a flat-rate calculation, common in SACCO practice:
`totalInterest = principal × (annualRate/100) × (termMonths/12)`, split evenly
across the term. See `lib/loan-calc.ts` if your SACCO uses reducing-balance
interest instead — that formula lives in one place and is easy to swap.

## Deploying to production

This app runs anywhere Node.js runs (it doesn't require the Vercel platform
specifically). Two things to decide before you deploy:

1. **Database.** SQLite (the default) is great for a single-instance deployment
   with persistent disk — e.g. a small VPS, Fly.io, Railway, or Render with a
   persistent volume. It is **not** a fit for serverless platforms (Vercel's
   default functions, for example) because they don't guarantee persistent
   local disk. If you deploy serverless, switch the database:
   - Swap `better-sqlite3` for `pg` and change `lib/db/index.ts` to use
     `drizzle-orm/node-postgres`, point `DATABASE_PATH` at a `DATABASE_URL`
     for a hosted Postgres instance (Neon, Supabase, Railway, RDS, etc.), and
     regenerate migrations with `drizzle-kit generate`. The schema in
     `lib/db/schema.ts` uses portable types and will translate directly.

2. **Secrets.** Set `AUTH_SECRET` to a long random value in your host's
   environment variable settings — never commit `.env.local`.

Typical deploy steps (adjust for your host):
```bash
npm install
npm run build
npm run db:migrate   # run once against the production database
npm start             # or however your host starts a Next.js app
```

## Project structure

```
app/
  login/              Public login page
  dashboard/          Staff back office (requires ADMIN or STAFF)
    members/          Member list, registration, member detail
    loans/            All loans — pending, active, closed
  portal/             Member self-service (requires MEMBER)
    savings/          Own savings/shares view
    loans/            Own loans + apply
components/           Shared UI (Button, Card, Stamp, forms)
lib/
  actions/            Server actions (auth, members, savings, loans)
  auth/                Session (JWT), password hashing, route guards
  db/                  Drizzle schema, client, migration runner
  loan-calc.ts         Loan interest/schedule math
  seed.ts              Demo data
drizzle/               Generated SQL migrations
```

## Next steps you may want

- An admin screen to create/manage staff logins (currently done at the DB level)
- Dividend calculation and end-of-year payout tooling
- Loan guarantor tracking (common in SACCO lending)
- SMS/email notifications for approvals and repayment reminders
- Audit log of who changed what
- CSV export of members, transactions, and loans for your auditor/regulator

The codebase is deliberately straightforward (Server Actions, no heavy
framework-on-framework) so any of the above can be added without restructuring
what's here.

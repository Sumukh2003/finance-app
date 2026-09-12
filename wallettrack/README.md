# WalletTrack

A personal finance tracker: record income and expenses, cap categories with
monthly budgets, and see where the money actually went.

Built with Next.js 16 (App Router), TypeScript, MongoDB and Tailwind CSS v4.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in MONGODB_URI and AUTH_SECRET
npm run dev
```

Open <http://localhost:3000>.

`AUTH_SECRET` must be at least 32 characters. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### No database handy?

`npm run dev:db` starts a throwaway MongoDB on `localhost:27017`. Leave it
running in one terminal and point `MONGODB_URI` at it:

```
MONGODB_URI=mongodb://127.0.0.1:27017/wallettrack
```

Its data lives in memory and is discarded when you stop it — development only.

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run dev:db` | Throwaway local MongoDB on port 27017 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Unit tests (Vitest) |
| `npm run test:watch` | Tests in watch mode |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run verify` | Typecheck, lint and test — run before pushing |

---

## Architecture

```
src/
├── app/
│   ├── api/                    Route handlers (the entire HTTP surface)
│   ├── dashboard/              Authenticated app: overview, transactions, budgets, settings
│   ├── login/ register/        Auth pages
│   └── page.tsx about/ contact/  Public marketing pages
├── components/
│   ├── ui/                     Design-system primitives (button, card, dialog, select…)
│   ├── layout/                 App shell, sidebar, site header/footer
│   ├── charts/ transactions/ budgets/ auth/   Feature components
│   └── providers.tsx           Theme, toasts, session context
├── lib/
│   ├── api/                    Response envelope, typed errors, route wrapper
│   ├── auth/                   Session tokens, password hashing, request guard
│   ├── validations/            Zod schemas shared by client and server
│   ├── queries/                Reusable database queries and aggregations
│   └── env.ts db.ts format.ts date.ts csv.ts rate-limit.ts
├── models/                     Mongoose schemas and indexes
└── proxy.ts                    Auth routing + security headers on every request
```

### Principles

**One schema, both sides.** Every payload is described once in
`src/lib/validations/` and used by the form (instant feedback) and the route
handler (the authoritative check). Server-side field errors map straight back
onto the same inputs.

**One response envelope.** Every endpoint answers with
`{ success: true, data }` or `{ success: false, error: { code, message, fields? } }`.
`src/lib/api/response.ts` wraps each handler so expected failures become precise
status codes and unexpected ones become a logged 500 with no internals leaked.

**Ownership lives in the query.** Every database call is filtered by the
session's `userId`, so another user's id is a 404 rather than a leak — there is
no separate permission check to forget.

**The database does the arithmetic.** Totals, category breakdowns and budget
spend are aggregations, not sums over whatever page happens to be loaded.

---

## Security

| Area | Approach |
| --- | --- |
| Sessions | HS256 JWT in an `httpOnly`, `sameSite=lax`, `secure` cookie — unreadable by scripts, so an XSS bug cannot exfiltrate a session |
| Passwords | bcrypt, cost 12; unknown emails still pay the hashing cost, so response timing does not reveal who is registered |
| Login errors | One message for "no such user" and "wrong password" |
| Rate limiting | Per-IP and per-account on sign-in; per-IP on registration, password change and the contact form |
| Input | Zod on every body and query string; sort fields are a whitelist, page size is capped |
| Search | Regex metacharacters escaped, so a search term cannot become a pattern |
| CSP | Per-request nonce with `strict-dynamic`, plus HSTS, `X-Frame-Options`, `nosniff`, and a restrictive `Permissions-Policy` |
| CSV export | Cells beginning `=`, `+`, `-` or `@` are neutralised so a note cannot execute as a formula in Excel or Sheets |
| Email | Contact-form values are stripped of CR/LF before reaching headers, so the form cannot be used to inject `Bcc` |

Secrets are validated at boot by `src/lib/env.ts`; a misconfigured deployment
fails immediately with a readable message instead of at the first request.

---

## API

All endpoints return the shared envelope. Authentication is the session cookie —
no `Authorization` header, no token in `localStorage`.

### Auth

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account and sign in |
| `POST` | `/api/auth/login` | Sign in |
| `POST` | `/api/auth/logout` | Clear the session |
| `GET` | `/api/auth/me` | Current user |
| `PATCH` | `/api/auth/me` | Update name and currency |
| `POST` | `/api/auth/password` | Change password |

### Transactions

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/transactions` | List with filters, pagination and totals |
| `POST` | `/api/transactions` | Create |
| `GET` `PATCH` `DELETE` | `/api/transactions/:id` | Read, update, delete one |
| `GET` | `/api/transactions/export` | CSV of everything matching the filters |

Query parameters: `page`, `limit`, `search`, `type`, `category`, `startDate`,
`endDate`, `minAmount`, `maxAmount`, `sort`.

`totals` covers the whole filtered set, not just the returned page.

### Budgets

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/budgets?month=YYYY-MM` | Budgets joined with spend for that month |
| `POST` | `/api/budgets` | Create (one per category per month) |
| `PATCH` `DELETE` | `/api/budgets/:id` | Update or remove |

### Other

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/dashboard?month=YYYY-MM` | Summary, category split, 12-month trend, budgets, recent activity |

`summary` separates two figures that are easy to confuse:

- `net` — what the selected month did on its own, `income - expense`.
- `balance` — a **running total across every transaction up to the end of that
  month**, carried forward from `openingBalance`. Adding or deleting anything,
  in any month, moves it. A month with no activity still shows the balance you
  carried into it rather than zero.

`balance === openingBalance + net` always holds.
| `POST` | `/api/contact` | Contact form (needs SMTP configured) |
| `GET` | `/api/health` | Liveness probe for load balancers |

---

## Data model

**User** — name, unique lowercase email, bcrypt hash (never selected by
default), currency preference.

**Transaction** — owner, `income`/`expense`, category, optional note, amount,
date. Indexed on `(userId, date)`, `(userId, type, date)` and
`(userId, category, date)`; every query is scoped to one user, so `userId` leads
each index.

**Budget** — owner, category, limit, month as `YYYY-MM`. A unique index on
`(userId, month, category)` enforces one budget per category per month in the
database rather than with a read-then-write check two concurrent requests could
both pass.

---

## Testing

```bash
npm test
```

Unit tests cover the logic where a mistake is silent rather than loud: CSV
escaping and formula-injection defusing, month arithmetic across year and leap
boundaries, currency and percentage formatting, rate-limit windows, regex
escaping, and the transaction filter builder.

---

## Deployment

Works on any platform that runs Next.js. On Vercel, set `MONGODB_URI` and
`AUTH_SECRET` (plus the optional SMTP variables) in the project's environment
settings.

Two notes for production:

- **Rate limiting is in-process.** With several instances behind a load
  balancer, each enforces its own quota. Swap the store in
  `src/lib/rate-limit.ts` for Redis behind the same interface — no call site
  changes.
- **Rotating `AUTH_SECRET` signs everyone out.** That is the intended way to
  revoke all sessions at once.

---

## Licence

MIT.

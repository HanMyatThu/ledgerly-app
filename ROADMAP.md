# Ledgerly roadmap

This file is the working plan for building Ledgerly in small, steady steps.
Each day aims for 7 to 10 small commits that each leave the app working.

## How to pick up the work

1. Open the first day below that still has unchecked items.
2. Do the items in order. Each item is meant to be one commit.
3. Run `npm test` and `npm run build` before each commit.
4. Tick the item off here in the same commit (or in a final "docs: update roadmap" commit for the day).
5. Push at the end of the day.

Commit messages follow Conventional Commits: `feat(api): ...`, `feat(web): ...`, `fix: ...`, `test: ...`, `docs: ...`, `chore: ...`.

## Day 0 (2026-11-01): foundation

- [x] chore: initialize monorepo with npm workspaces
- [x] feat(api): Express server with health endpoint
- [x] feat(shared): categories and money helpers with tests
- [x] feat(shared): transaction validation with tests
- [x] feat(api): transactions CRUD with in-memory store and tests
- [x] feat(api): category list endpoint
- [x] feat(web): Vite React scaffold with API proxy
- [x] feat(web): API client and transaction list
- [x] feat(web): add transaction form with client-side validation
- [x] feat(web): income, expense and balance summary
- [x] docs: add roadmap

## Day 1: persistence

Goal: transactions survive an API restart.

- [ ] chore(api): add `better-sqlite3` and a `data/` folder (gitignored)
- [ ] feat(api): database module that opens the SQLite file and runs migrations
- [ ] feat(api): first migration creating the `transactions` table
- [ ] feat(api): SQLite-backed transaction store with the same interface as the in-memory one
- [ ] feat(api): pick the store from config (`STORE=memory|sqlite`), default sqlite
- [ ] test(api): run the CRUD tests against both stores
- [ ] feat(api): `npm run seed` script that inserts a month of sample data
- [ ] chore(api): `.env.example` with `PORT`, `DATABASE_FILE`, `STORE`
- [ ] docs: document persistence and seeding in README

## Day 2: filtering and search

Goal: find transactions quickly.

- [ ] feat(api): filter list by `from`/`to` date query params
- [ ] feat(api): filter list by `type` and `categoryId`
- [ ] feat(api): search notes with `q`
- [ ] feat(api): paginate with `limit`/`offset` and return a total count
- [ ] test(api): cover filters and pagination
- [ ] feat(web): month picker that loads one month at a time
- [ ] feat(web): type and category filter controls
- [ ] feat(web): debounced note search box
- [ ] feat(web): "load more" button for paginated results

## Day 3: editing and UX polish

Goal: fixing mistakes is easy and the app feels solid.

- [ ] feat(web): edit a transaction inline, reusing the form
- [ ] feat(web): confirm before deleting, with undo toast
- [ ] feat(web): loading skeletons for list and summary
- [ ] feat(web): show API errors in a dismissible banner
- [ ] feat(web): group the list by day with daily totals
- [ ] feat(web): keyboard shortcut `n` to focus the amount field
- [ ] refactor(web): move data fetching into a `useTransactions` hook
- [ ] feat(web): dark mode using `prefers-color-scheme`

## Day 4: budgets

Goal: set a monthly limit per category and see progress.

- [ ] feat(shared): budget validation
- [ ] feat(api): migration for `budgets` table (category, month, limit)
- [ ] feat(api): budgets CRUD endpoints
- [ ] feat(api): `GET /api/budgets/progress?month=` returning spent vs limit
- [ ] test(api): budgets and progress tests
- [ ] feat(web): budgets page with a form to set limits
- [ ] feat(web): progress bars per category, red when over budget
- [ ] feat(web): simple tab navigation between Transactions and Budgets
- [ ] feat(web): warn in the form when an expense pushes a category over budget

## Day 5: reports and charts

Goal: see where money goes.

- [ ] feat(api): `GET /api/reports/monthly` totals by month for the last 12 months
- [ ] feat(api): `GET /api/reports/categories?month=` totals by category
- [ ] test(api): report endpoint tests
- [ ] chore(web): add `recharts`
- [ ] feat(web): Reports page with spending by category donut chart
- [ ] feat(web): income vs expense bar chart over 12 months
- [ ] feat(web): top 5 categories table with percentage of spend
- [ ] feat(web): month-over-month change indicator on summary cards

## Day 6: import, export and recurring

Goal: get data in and out, and stop retyping rent.

- [ ] feat(api): `GET /api/transactions/export.csv`
- [ ] feat(api): CSV import endpoint with row-level validation report
- [ ] test(api): CSV round-trip test
- [ ] feat(web): export button
- [ ] feat(web): import dialog showing accepted and rejected rows
- [ ] feat(api): recurring transactions table and endpoints (monthly/weekly)
- [ ] feat(api): materialize due recurring transactions on startup and daily
- [ ] feat(web): mark a transaction as recurring from the form

## Day 7: quality and release

Goal: a project someone else can clone, run and trust.

- [ ] chore: ESLint + Prettier config for the whole monorepo
- [ ] chore: fix lint warnings
- [ ] test(web): Vitest + Testing Library setup
- [ ] test(web): tests for TransactionForm and SummaryCards
- [ ] ci: GitHub Actions workflow running lint, test and build
- [ ] feat(api): request logging and a central error handler
- [ ] chore: Dockerfile for the API and a docker-compose for both apps
- [ ] docs: screenshots and feature list in README
- [ ] chore: tag v0.1.0 and add CHANGELOG.md

## Later ideas

- User accounts with JWT auth so several people can use one server
- Multiple accounts/wallets (cash, card, savings) with transfers
- Multi-currency with a base currency setting
- Saved filters and tags
- PWA install and offline entry queue

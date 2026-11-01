# Ledgerly roadmap

This file is the working plan for building Ledgerly slowly, in small steady steps.
Each day has 15 to 20 items, and each item is one small commit that leaves the app working.
Do one day at a time. There is no rush to finish.

## How to pick up the work

1. Open the first day below that still has unchecked items.
2. Do the items in order, one commit per item. If an item is bigger than expected, split it into more commits.
3. Run `npm test` and `npm run build` before each commit.
4. Tick the item off here in the same commit.
5. Push at the end of the day.

Commit messages follow Conventional Commits, for example `feat(web): create Header component`, `feat(api): ...`, `fix: ...`, `test: ...`, `style: ...`, `refactor: ...`, `docs: ...`, `chore: ...`.

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

## Day 1: layout and components

Goal: break the single page into small reusable pieces.

- [x] feat(web): create Header component
- [x] feat(web): create Footer component with version and repo link
- [ ] feat(web): create Layout component wrapping header, main and footer
- [ ] feat(web): create Card component
- [ ] refactor(web): use Card in SummaryCards
- [ ] refactor(web): use Card in TransactionForm
- [ ] feat(web): create Button component with primary and ghost variants
- [ ] refactor(web): use Button in TransactionForm
- [ ] refactor(web): use Button in TransactionList
- [ ] feat(web): create TextField component with label and error
- [ ] refactor(web): use TextField for amount, date and note inputs
- [ ] feat(web): create SelectField component
- [ ] refactor(web): use SelectField for category
- [ ] feat(web): create SegmentedControl component
- [ ] refactor(web): use SegmentedControl for the type toggle
- [ ] feat(web): create EmptyState component
- [ ] refactor(web): use EmptyState in TransactionList
- [ ] style(web): move design tokens into tokens.css

## Day 2: styling and polish

- [ ] feat(web): create Spinner component
- [ ] feat(web): show Spinner while transactions load
- [ ] feat(web): create Alert component
- [ ] refactor(web): show load errors with Alert
- [ ] feat(web): create CategoryIcon component with an emoji per category
- [ ] feat(web): show CategoryIcon in transaction rows
- [ ] feat(web): create Amount component for signed, colored money
- [ ] refactor(web): use Amount in TransactionList
- [ ] refactor(web): use Amount in SummaryCards
- [ ] feat(web): create formatDate helper for friendly dates
- [ ] feat(web): show friendly dates in transaction rows
- [ ] style(web): add hover state to transaction rows
- [ ] style(web): add focus-visible outlines to buttons and inputs
- [ ] style(web): add subtle shadow to cards
- [ ] feat(web): add favicon
- [ ] feat(web): add page meta description
- [ ] style(web): tidy mobile spacing

## Day 3: persistence setup

Goal: start moving from memory to SQLite.

- [ ] chore(api): add better-sqlite3 dependency
- [ ] chore: gitignore the api data folder
- [ ] feat(api): create config module reading env vars
- [ ] chore(api): add .env.example
- [ ] feat(api): create database connection module
- [ ] feat(api): create migrations table
- [ ] feat(api): create migration runner
- [ ] feat(api): add migration for transactions table
- [ ] feat(api): run migrations on startup
- [ ] test(api): test migration runner on a temp database
- [ ] feat(api): create SQLite transaction store list method
- [ ] feat(api): add SQLite store get method
- [ ] feat(api): add SQLite store create method
- [ ] feat(api): add SQLite store update method
- [ ] feat(api): add SQLite store remove method
- [ ] test(api): unit tests for the SQLite store

## Day 4: persistence wiring

- [ ] feat(api): choose store from STORE env var
- [ ] refactor(api): share CRUD tests between memory and SQLite stores
- [ ] feat(api): create seed data file with a month of transactions
- [ ] feat(api): add npm run seed script
- [ ] feat(api): add npm run db:reset script
- [ ] feat(api): add request logger middleware
- [ ] feat(api): add central error handler middleware
- [ ] feat(api): add notFound helper for 404 responses
- [ ] refactor(api): use notFound helper in transactions routes
- [ ] feat(api): create asyncHandler wrapper
- [ ] refactor(api): wrap route handlers with asyncHandler
- [ ] feat(api): graceful shutdown closes the database
- [ ] feat(api): add database status to health endpoint
- [ ] test(api): health endpoint test
- [ ] docs: document persistence in README
- [ ] docs: document seeding in README

## Day 5: API filters

- [ ] feat(api): filter transactions by from date
- [ ] feat(api): filter transactions by to date
- [ ] test(api): date range filter tests
- [ ] feat(api): filter transactions by type
- [ ] feat(api): filter transactions by category
- [ ] test(api): type and category filter tests
- [ ] feat(api): search notes with q param
- [ ] test(api): note search test
- [ ] feat(shared): add parseListQuery helper
- [ ] test(shared): parseListQuery tests
- [ ] refactor(api): use parseListQuery in transactions route
- [ ] feat(api): add limit and offset pagination
- [ ] feat(api): return total count header
- [ ] test(api): pagination tests
- [ ] feat(api): add sort param for date and amount
- [ ] test(api): sort tests
- [ ] docs: document list query params in README

## Day 6: web filters

- [ ] feat(web): create useTransactions hook
- [ ] refactor(web): move fetching from App into useTransactions
- [ ] feat(web): create MonthPicker component
- [ ] feat(web): load transactions for the selected month
- [ ] feat(web): show summary for the selected month
- [ ] feat(web): create FilterBar component
- [ ] feat(web): add type filter to FilterBar
- [ ] feat(web): add category filter to FilterBar
- [ ] feat(web): create useDebounce hook
- [ ] feat(web): add note search box to FilterBar
- [ ] feat(web): keep filters in the URL query string
- [ ] feat(web): add clear filters button
- [ ] feat(web): create LoadMoreButton component
- [ ] feat(web): paginate the transaction list
- [ ] feat(web): show result count
- [ ] feat(web): add sort dropdown

## Day 7: editing

- [ ] feat(web): add edit button to transaction rows
- [ ] feat(web): create Modal component
- [ ] feat(web): close Modal on Escape and backdrop click
- [ ] feat(web): trap focus inside Modal
- [ ] refactor(web): let TransactionForm accept initial values
- [ ] feat(web): open TransactionForm in a Modal for editing
- [ ] feat(web): add updateTransaction to API client
- [ ] feat(web): save edits and refresh the list
- [ ] feat(web): create ConfirmDialog component
- [ ] feat(web): confirm before deleting
- [ ] feat(web): create Toast component
- [ ] feat(web): create ToastProvider and useToast hook
- [ ] feat(web): toast after create, edit and delete
- [ ] feat(web): undo delete from the toast
- [ ] feat(web): group transactions by day
- [ ] feat(web): show daily totals in group headers
- [ ] feat(web): press n to focus the amount field

## Day 8: budgets API

- [ ] feat(shared): add budget validation
- [ ] test(shared): budget validation tests
- [ ] feat(api): add migration for budgets table
- [ ] feat(api): create budget store list method
- [ ] feat(api): add budget store upsert method
- [ ] feat(api): add budget store remove method
- [ ] test(api): budget store tests
- [ ] feat(api): GET budgets for a month
- [ ] feat(api): PUT budget for a category and month
- [ ] feat(api): DELETE budget
- [ ] test(api): budget route tests
- [ ] feat(api): add spentByCategory query
- [ ] feat(api): GET budget progress for a month
- [ ] test(api): budget progress tests
- [ ] feat(api): copy last month's budgets endpoint
- [ ] docs: document budgets API in README

## Day 9: budgets UI

- [ ] feat(web): add react-router
- [ ] feat(web): create NavTabs component
- [ ] feat(web): add Transactions route
- [ ] feat(web): add Budgets route placeholder
- [ ] feat(web): add budget calls to API client
- [ ] feat(web): create useBudgets hook
- [ ] feat(web): create ProgressBar component
- [ ] feat(web): create BudgetRow component
- [ ] feat(web): list budgets with progress
- [ ] feat(web): color progress red when over budget
- [ ] feat(web): create BudgetForm component
- [ ] feat(web): set a budget from BudgetForm
- [ ] feat(web): remove a budget
- [ ] feat(web): copy last month's budgets button
- [ ] feat(web): show budget totals at the top
- [ ] feat(web): warn in TransactionForm when an expense goes over budget

## Day 10: reports API

- [ ] feat(api): monthly totals query
- [ ] feat(api): GET reports monthly endpoint
- [ ] test(api): monthly report tests
- [ ] feat(api): category totals query
- [ ] feat(api): GET reports categories endpoint
- [ ] test(api): category report tests
- [ ] feat(api): top categories query
- [ ] feat(api): GET reports top endpoint
- [ ] test(api): top categories tests
- [ ] feat(api): average daily spend query
- [ ] feat(api): add average daily spend to summary endpoint
- [ ] feat(api): GET summary endpoint for a month
- [ ] test(api): summary endpoint tests
- [ ] refactor(web): load SummaryCards from summary endpoint
- [ ] feat(api): month-over-month change in summary
- [ ] docs: document reports API in README

## Day 11: reports UI

- [ ] chore(web): add recharts
- [ ] feat(web): add Reports route
- [ ] feat(web): add report calls to API client
- [ ] feat(web): create useReports hook
- [ ] feat(web): create ChartCard component
- [ ] feat(web): create CategoryDonut chart
- [ ] feat(web): add legend to CategoryDonut
- [ ] feat(web): create IncomeExpenseBars chart
- [ ] feat(web): add tooltip formatting to charts
- [ ] feat(web): create TopCategoriesTable component
- [ ] feat(web): show percentage of spend in TopCategoriesTable
- [ ] feat(web): create TrendBadge component
- [ ] feat(web): show month-over-month change on summary cards
- [ ] feat(web): show average daily spend
- [ ] feat(web): empty state for reports with no data
- [ ] style(web): responsive grid for report cards

## Day 12: CSV import and export

- [ ] feat(shared): add toCsv helper
- [ ] test(shared): toCsv tests
- [ ] feat(shared): add parseCsv helper
- [ ] test(shared): parseCsv tests
- [ ] feat(api): GET transactions export csv
- [ ] test(api): export test
- [ ] feat(api): accept CSV body on import endpoint
- [ ] feat(api): validate each imported row
- [ ] feat(api): return accepted and rejected rows
- [ ] test(api): import tests
- [ ] feat(web): add export button
- [ ] feat(web): create FileDrop component
- [ ] feat(web): create ImportDialog component
- [ ] feat(web): preview rows before importing
- [ ] feat(web): show rejected rows with reasons
- [ ] docs: document CSV format in README

## Day 13: recurring transactions

- [ ] feat(shared): add recurrence helpers for weekly and monthly
- [ ] test(shared): recurrence helper tests
- [ ] feat(api): add migration for recurring table
- [ ] feat(api): create recurring store
- [ ] test(api): recurring store tests
- [ ] feat(api): recurring CRUD routes
- [ ] test(api): recurring route tests
- [ ] feat(api): materialize due recurring transactions
- [ ] feat(api): run materializer on startup
- [ ] feat(api): run materializer daily
- [ ] test(api): materializer tests
- [ ] feat(web): add repeat option to TransactionForm
- [ ] feat(web): add Recurring route
- [ ] feat(web): list recurring rules
- [ ] feat(web): pause and resume a recurring rule
- [ ] feat(web): show a repeat badge on generated transactions

## Day 14: tooling

- [ ] chore: add ESLint config
- [ ] chore: add Prettier config
- [ ] chore: add lint and format scripts
- [ ] style: format the codebase with Prettier
- [ ] fix(api): resolve lint warnings
- [ ] fix(web): resolve lint warnings
- [ ] fix(shared): resolve lint warnings
- [ ] chore(web): add Vitest and Testing Library
- [ ] test(web): Button tests
- [ ] test(web): TextField tests
- [ ] test(web): SummaryCards tests
- [ ] test(web): TransactionForm tests
- [ ] test(web): TransactionList tests
- [ ] test(web): useDebounce tests
- [ ] ci: add GitHub Actions workflow for lint
- [ ] ci: run tests and build in the workflow
- [ ] docs: add CI badge to README

## Day 15: release

- [ ] chore(api): add Dockerfile
- [ ] chore(web): add Dockerfile with nginx
- [ ] chore: add docker-compose for both apps
- [ ] docs: document Docker setup
- [ ] feat(web): add dark mode tokens
- [ ] feat(web): create ThemeToggle component
- [ ] feat(web): remember theme choice
- [ ] feat(web): add currency setting
- [ ] feat(web): use currency setting in formatMoney calls
- [ ] feat(web): add 404 page
- [ ] feat(web): add About page
- [ ] docs: add feature list to README
- [ ] docs: add screenshots to README
- [ ] docs: add CONTRIBUTING.md
- [ ] docs: add CHANGELOG.md
- [ ] chore: bump version to 0.1.0

## Later ideas

- User accounts with JWT auth so several people can use one server
- Multiple accounts/wallets (cash, card, savings) with transfers
- Multi-currency with exchange rates
- Saved filters and tags
- PWA install and offline entry queue

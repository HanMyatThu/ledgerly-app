# Ledgerly

[![CI](https://github.com/HanMyatThu/ledgerly-app/actions/workflows/ci.yml/badge.svg)](https://github.com/HanMyatThu/ledgerly-app/actions/workflows/ci.yml)

Ledgerly is a small personal budget and expense tracker. Log what you spend and earn, sort it into categories, set monthly budgets, and see where your money goes.

It is a monorepo with a React front end and a Node.js API.

## Features

- **Transactions:** add, edit and delete income and expenses, with categories, notes and an undo after deleting. Press <kbd>n</kbd> to jump to a new entry.
- **Find things fast:** search notes, filter by type and category, sort by date or amount, and page through long lists. The month and filters live in the address bar, so views can be bookmarked.
- **Monthly budgets:** set a limit per expense category, see progress bars and what is left, copy last month's budgets, and get a warning before an entry goes over.
- **Recurring transactions:** make rent, salary or subscriptions repeat weekly or monthly. Rules can be paused, resumed or deleted, and their transactions carry a badge.
- **Reports:** a six-month income and expense chart, spending by category, top categories, month-over-month trends and average daily spend.
- **CSV import and export:** download any filtered list, or import a file with a preview first and a clear list of rows that were skipped and why.
- **Comfortable to use:** dark mode (automatic or chosen), a display currency setting, keyboard-friendly dialogs and a layout that works on phones.
- **Easy to run:** SQLite storage with migrations, sample data, Docker images and a Compose file, and CI that runs lint, tests and the build.

## Layout

```
apps/
  api/      Express REST API
  web/      React app (Vite)
packages/
  shared/   Code shared by both apps (categories, money helpers, validation)
```

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev:api   # http://localhost:4000
npm run dev:web   # http://localhost:5173
```

Before pushing, check the code:

```bash
npm run lint           # ESLint (npm run lint:fix fixes what it can)
npm run format:check   # Prettier (npm run format rewrites files)
npm test
```

## Running with Docker

Docker Compose runs the API and the web app in separate containers:

```bash
docker compose up --build
```

Then open http://localhost:8080. The web container serves the built app with nginx and forwards `/api` requests to the API container. The SQLite database is kept in the `ledgerly-data` volume, so your data survives restarts and rebuilds. `docker compose down -v` deletes it.

To build or run one image on its own, build from the repository root, because both images need the shared package:

```bash
docker build -f apps/api/Dockerfile -t ledgerly-api .
docker run -p 4000:4000 -v ledgerly-data:/data ledgerly-api

docker build -f apps/web/Dockerfile -t ledgerly-web .
docker run -p 8080:80 -e API_URL=http://host.docker.internal:4000 ledgerly-web
```

| Variable        | Image | Default             | Meaning                               |
| --------------- | ----- | ------------------- | ------------------------------------- |
| `PORT`          | api   | `4000`              | Port the API listens on               |
| `DATABASE_PATH` | api   | `/data/ledgerly.db` | SQLite file; keep `/data` on a volume |
| `LOG_LEVEL`     | api   | `info`              | `silent` turns off request logs       |
| `API_URL`       | web   | `http://api:4000`   | Where nginx sends `/api` requests     |

The API image has a health check on `/api/health`, and Compose waits for it before starting the web container.

## Persistence

By default the API keeps transactions in a SQLite database at `apps/api/data/ledgerly.db`, so they survive restarts. The file and folder are created on first start and are ignored by git.

Settings come from environment variables (see [`apps/api/.env.example`](apps/api/.env.example)):

| Variable        | Default                     | Meaning                                       |
| --------------- | --------------------------- | --------------------------------------------- |
| `PORT`          | `4000`                      | Port the API listens on                       |
| `STORE`         | `sqlite`                    | `sqlite`, or `memory` to keep nothing on disk |
| `DATABASE_PATH` | `apps/api/data/ledgerly.db` | Location of the SQLite file                   |
| `LOG_LEVEL`     | `info`                      | Set to `silent` to turn off request logs      |

Schema changes live in `apps/api/src/db/migrations` and run automatically when the API starts. Each one is applied once and recorded in a `migrations` table. To change the schema, add a new numbered migration rather than editing an old one.

`npm run db:reset` deletes the database and recreates it empty.

## Sample data

To try the app with realistic numbers, seed the database with a month of sample transactions:

```bash
npm run seed              # current month
npm run seed -- 2026-10   # a specific month
```

Seeding adds to whatever is already there, so run `npm run db:reset` first for a clean slate. The sample data lives in `apps/api/src/db/seedData.js`.

## Listing transactions

`GET /api/transactions` accepts these optional query parameters. They can be combined, and any value that is missing or malformed is ignored.

| Param      | Example      | Meaning                                                     |
| ---------- | ------------ | ----------------------------------------------------------- |
| `from`     | `2026-11-01` | Only transactions on or after this date                     |
| `to`       | `2026-11-30` | Only transactions on or before this date                    |
| `type`     | `expense`    | `income` or `expense`                                       |
| `category` | `dining`     | One category id (see `GET /api/categories`)                 |
| `q`        | `coffee`     | Case-insensitive search in notes                            |
| `sort`     | `-amount`    | `-date` (default), `date`, `-amount` or `amount`            |
| `limit`    | `50`         | Page size, at most 200. Without it, every match is returned |
| `offset`   | `50`         | Number of matches to skip                                   |

The response includes an `X-Total-Count` header with the number of matches before paging.

```bash
curl "http://localhost:4000/api/transactions?type=expense&from=2026-11-01&sort=-amount&limit=10"
```

## Budgets API

A budget is a monthly spending limit for one expense category. Months are written `YYYY-MM` and amounts are in cents.

| Method & path                             | What it does                                                    |
| ----------------------------------------- | --------------------------------------------------------------- |
| `GET /api/budgets?month=2026-11`          | List the month's budgets                                        |
| `PUT /api/budgets/2026-11/groceries`      | Set a budget; body `{ "amountCents": 40000 }`. Replaces any old |
| `DELETE /api/budgets/2026-11/groceries`   | Remove a budget                                                 |
| `GET /api/budgets/progress?month=2026-11` | Spent, remaining and percent used for each budget               |
| `POST /api/budgets/2026-11/copy-previous` | Copy October's budgets into November, keeping any already set   |

A progress entry looks like this:

```json
{
  "categoryId": "dining",
  "budgetCents": 10000,
  "spentCents": 12500,
  "remainingCents": -2500,
  "percent": 125,
  "over": true
}
```

Budgets can only be set for expense categories. Invalid input returns `400` with an `errors` object keyed by field.

## Reports API

All amounts are in cents and months are `YYYY-MM`. When `month` is left out, the current month is used.

| Path                                                     | Returns                                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `GET /api/reports/summary?month=2026-11`                 | Income, expenses, balance, count, average daily spend and the previous month |
| `GET /api/reports/monthly?from=2026-06&to=2026-11`       | Income, expenses and net for every month in the span (default: last six)     |
| `GET /api/reports/categories?month=2026-11&type=expense` | Total, count and percent share per category, largest first                   |
| `GET /api/reports/top?month=2026-11&limit=5`             | The biggest spending categories (1 to 20, default 5)                         |

Average daily spend divides the month's expenses by the days that have passed so far, so it is meaningful mid-month. Month-over-month change percents are `null` when the previous month had nothing to compare against.

```json
{
  "month": "2026-11",
  "incomeCents": 300000,
  "expenseCents": 17500,
  "balanceCents": 282500,
  "count": 5,
  "averageDailySpendCents": 972,
  "previous": {
    "month": "2026-10",
    "incomeCents": 300000,
    "expenseCents": 20000,
    "incomeChangePercent": 0,
    "expenseChangePercent": -13
  }
}
```

## CSV import and export

The Transactions page has **Export CSV** and **Import CSV** buttons. Both use the same layout, so an exported file can be imported again.

```csv
date,type,category,amount,note
2026-11-03,expense,dining,8.99,Lunch
2026-11-01,income,salary,2500.00,
```

| Column     | Required | Format                                                           |
| ---------- | -------- | ---------------------------------------------------------------- |
| `date`     | yes      | `YYYY-MM-DD`                                                     |
| `type`     | yes      | `expense` or `income`                                            |
| `category` | yes      | a category id such as `groceries` or `salary`, matching the type |
| `amount`   | yes      | a positive amount in dollars, such as `12.50` (no currency sign) |
| `note`     | no       | up to 200 characters                                             |

Column names are not case-sensitive, columns can be in any order, and extra columns are ignored. Cells with commas, quotes or line breaks are quoted the usual CSV way. On export, text starting with `=`, `+`, `-` or `@` gets a leading `'` so spreadsheet apps do not run it as a formula; import removes it again.

- `GET /api/transactions/export.csv` takes the same filters as the list (`from`, `to`, `type`, `category`, `q`, `sort`) and returns every match as a download. Paging is ignored.
- `POST /api/transactions/import` takes the file as the request body with `Content-Type: text/csv` (up to 1 MB and 1000 rows). Valid rows are saved and invalid rows are skipped. The response lists both:

```json
{
  "accepted": [{ "id": "…", "date": "2026-11-03", "amountCents": 899, "...": "…" }],
  "rejected": [
    {
      "line": 4,
      "values": { "date": "bad-date", "...": "…" },
      "errors": { "date": "Date must be in YYYY-MM-DD format" }
    }
  ]
}
```

`line` is the line number in the file, counting the header as line 1. The status is `201` when at least one row was saved and `200` when none were. A file that is empty, malformed or missing a required column gets a `400` and nothing is saved.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the day-by-day plan.

## License

MIT

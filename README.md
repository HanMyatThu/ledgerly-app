# Ledgerly

Ledgerly is a small personal budget and expense tracker. Log what you spend and earn, sort it into categories, set monthly budgets, and see where your money goes.

It is a monorepo with a React front end and a Node.js API.

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

| Param      | Example          | Meaning                                                      |
| ---------- | ---------------- | ------------------------------------------------------------ |
| `from`     | `2026-11-01`     | Only transactions on or after this date                      |
| `to`       | `2026-11-30`     | Only transactions on or before this date                     |
| `type`     | `expense`        | `income` or `expense`                                        |
| `category` | `dining`         | One category id (see `GET /api/categories`)                  |
| `q`        | `coffee`         | Case-insensitive search in notes                             |
| `sort`     | `-amount`        | `-date` (default), `date`, `-amount` or `amount`             |
| `limit`    | `50`             | Page size, at most 200. Without it, every match is returned  |
| `offset`   | `50`             | Number of matches to skip                                    |

The response includes an `X-Total-Count` header with the number of matches before paging.

```bash
curl "http://localhost:4000/api/transactions?type=expense&from=2026-11-01&sort=-amount&limit=10"
```

## Budgets API

A budget is a monthly spending limit for one expense category. Months are written `YYYY-MM` and amounts are in cents.

| Method & path                                | What it does                                                    |
| -------------------------------------------- | --------------------------------------------------------------- |
| `GET /api/budgets?month=2026-11`             | List the month's budgets                                        |
| `PUT /api/budgets/2026-11/groceries`         | Set a budget; body `{ "amountCents": 40000 }`. Replaces any old |
| `DELETE /api/budgets/2026-11/groceries`      | Remove a budget                                                 |
| `GET /api/budgets/progress?month=2026-11`    | Spent, remaining and percent used for each budget               |
| `POST /api/budgets/2026-11/copy-previous`    | Copy October's budgets into November, keeping any already set   |

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

| Path                                                 | Returns                                                                     |
| ---------------------------------------------------- | --------------------------------------------------------------------------- |
| `GET /api/reports/summary?month=2026-11`             | Income, expenses, balance, count, average daily spend and the previous month |
| `GET /api/reports/monthly?from=2026-06&to=2026-11`   | Income, expenses and net for every month in the span (default: last six)    |
| `GET /api/reports/categories?month=2026-11&type=expense` | Total, count and percent share per category, largest first             |
| `GET /api/reports/top?month=2026-11&limit=5`         | The biggest spending categories (1 to 20, default 5)                        |

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

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the day-by-day plan.

## License

MIT

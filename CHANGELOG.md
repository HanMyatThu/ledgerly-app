# Changelog

All notable changes to Ledgerly are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-11-28

The first release, built from November 1 to November 28, 2026.

### Added

- **Transactions:** create, edit and delete income and expenses with categories, notes and dates, plus undo after a delete and a keyboard shortcut (<kbd>n</kbd>) for a new entry.
- **Listing:** search, type and category filters, sorting by date or amount, paging with a total count, grouping by day, and filters kept in the address bar.
- **Storage:** SQLite with a migrations runner, an in-memory store for tests, sample data and reset scripts, and graceful shutdown.
- **Budgets:** monthly limits per expense category, progress and totals, copying the previous month, and a warning when a new entry would go over budget.
- **Reports API:** monthly totals, category breakdowns, top categories and a summary with average daily spend and month-over-month change.
- **Reports page:** a six-month income and expense chart, a spending donut with legend, a top categories table, trend badges and an empty state.
- **CSV:** export of any filtered list, and import with a preview, per-row validation and a list of rejected rows with reasons.
- **Recurring transactions:** weekly and monthly rules that add transactions on start-up, at midnight and when created or resumed. Rules can be paused, resumed and deleted from a Recurring page, and their transactions show a badge.
- **Settings:** dark mode (automatic, light or dark), remembered per device, and a display currency setting.
- **Pages:** an About page and a 404 page.
- **Tooling:** ESLint, Prettier, Vitest and Testing Library component tests, and a GitHub Actions workflow for lint, tests and the build on Node.js 20 and 22.
- **Deployment:** Dockerfiles for the API and the nginx-served web app, and a Docker Compose file with a persistent data volume.

### Fixed

- Dates in the entry form used the UTC day instead of the local day.
- Focus in dialogs skipped the first field.
- An empty note in an imported CSV row stopped the import.
- Deleting a recurring rule left its transactions pointing at it.
- Form errors were not read out by screen readers.

[0.1.0]: https://github.com/HanMyatThu/ledgerly-app/releases/tag/v0.1.0

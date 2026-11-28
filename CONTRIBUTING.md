# Contributing to Ledgerly

Thanks for helping out. This guide covers how to get set up and what a good change looks like.

## Setup

You need Node.js 20 or newer.

```bash
npm install
npm run dev:api   # API on http://localhost:4000
npm run dev:web   # web app on http://localhost:5173
npm run seed      # optional: a month of sample data
```

## Project layout

- `apps/api` is the Express API. Routes are in `src/routes`, storage in `src/store`, and database migrations in `src/db/migrations`.
- `apps/web` is the React app built with Vite. Pages are in `src/pages`, components in `src/components` and hooks in `src/hooks`.
- `packages/shared` holds code both apps use: categories, money helpers, validation, CSV and recurrence helpers.

## Before you open a pull request

Run the same checks as CI:

```bash
npm run lint
npm run format:check
npm test
npm run build
```

`npm run format` and `npm run lint:fix` fix most style problems for you.

## Writing changes

- Keep each pull request to one change, and each commit small and focused.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for messages, as the history does: `feat(web): ...`, `fix(api): ...`, `docs: ...`, `test(shared): ...`, `chore: ...`.
- Add or update tests with every behavior change. API and shared code use `node:test`. Web components use Vitest and Testing Library, in a `*.test.jsx` file next to the component.
- Store money as integer cents and dates as `YYYY-MM-DD` strings, in local time on the client.
- Never edit a database migration that has shipped. Add a new one instead.
- Use the color tokens in `apps/web/src/tokens.css` instead of hard-coded colors, so dark mode keeps working.
- Check new UI at phone width and in dark mode.

## Reporting bugs

Open an issue with the steps to reproduce, what you expected, and what happened. Include your browser and Node.js version if they might matter.

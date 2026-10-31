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

## License

MIT

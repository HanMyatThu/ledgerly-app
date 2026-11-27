# Build from the repository root so the shared workspace package is included:
#   docker build -f apps/api/Dockerfile -t ledgerly-api .
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
# Only the API and shared workspaces, without dev dependencies.
RUN npm ci --omit=dev --workspace @ledgerly/api --include-workspace-root=false

FROM node:20-bookworm-slim
ENV NODE_ENV=production \
    PORT=4000 \
    DATABASE_PATH=/data/ledgerly.db
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared packages/shared
COPY apps/api/package.json apps/api/
COPY apps/api/src apps/api/src
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://localhost:4000/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "apps/api/src/index.js"]

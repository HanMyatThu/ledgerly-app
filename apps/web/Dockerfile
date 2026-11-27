# Build from the repository root so the shared workspace package is included:
#   docker build -f apps/web/Dockerfile -t ledgerly-web .
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN npm ci --workspace @ledgerly/web --include-workspace-root=false
COPY packages/shared packages/shared
COPY apps/web apps/web
RUN npm run build --workspace @ledgerly/web

FROM nginx:1.27-alpine
# Where nginx forwards /api requests; docker-compose points this at the api service.
ENV API_URL=http://api:4000
COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80

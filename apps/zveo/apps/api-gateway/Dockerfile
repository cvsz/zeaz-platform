FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/api-gateway ./apps/api-gateway
RUN corepack enable && pnpm install --frozen-lockfile=false && pnpm run build:foundation && pnpm --filter @zveo/api-gateway build
FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app
EXPOSE 8080
CMD ["node", "apps/api-gateway/dist/server.js"]

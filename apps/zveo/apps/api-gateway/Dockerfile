FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/zeaz-api-gateway ./apps/zeaz-api-gateway
RUN corepack enable && pnpm install --frozen-lockfile && pnpm run build:foundation && pnpm --filter @zveo/api-gateway build
FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "const h=require('http');h.get('http://localhost:8080',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

USER node

EXPOSE 8080
CMD ["node", "apps/zeaz-api-gateway/dist/server.js"]

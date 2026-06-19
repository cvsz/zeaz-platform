FROM node:24-bookworm AS base
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/dashboard/package.json apps/dashboard/
COPY packages ./packages
COPY apps/dashboard ./apps/dashboard

RUN corepack enable && pnpm install --frozen-lockfile && pnpm run build:foundation && pnpm --filter @zveo/dashboard build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "const h=require('http');h.get('http://localhost:3000',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

USER node

CMD ["pnpm", "--filter", "@zveo/dashboard", "start"]

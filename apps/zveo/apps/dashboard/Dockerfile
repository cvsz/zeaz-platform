FROM node:24-bookworm AS base
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/dashboard/package.json apps/dashboard/
COPY packages ./packages
COPY apps/dashboard ./apps/dashboard

RUN corepack enable && pnpm install --frozen-lockfile=false && pnpm run build:foundation && pnpm --filter @zveo/dashboard build

EXPOSE 3000
CMD ["pnpm", "--filter", "@zveo/dashboard", "start"]

FROM node:22-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY services/portfolio-service/package.json ./services/portfolio-service/package.json
RUN npm ci

COPY packages ./packages
COPY services/portfolio-service ./services/portfolio-service

RUN npm run build -w services/portfolio-service

WORKDIR /app/services/portfolio-service
USER appuser
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD node -e "fetch('http://localhost:8095/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "run", "start"]

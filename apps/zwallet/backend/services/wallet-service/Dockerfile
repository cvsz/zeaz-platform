FROM node:22-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY services/wallet-service/package.json ./services/wallet-service/package.json
RUN npm ci

COPY packages ./packages
COPY services/wallet-service ./services/wallet-service

RUN npm run build -w services/wallet-service

WORKDIR /app/services/wallet-service
USER appuser
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD node -e "fetch('http://localhost:8090/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "run", "start"]

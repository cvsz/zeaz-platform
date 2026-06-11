FROM node:22-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
COPY services/gateway/package.json ./services/gateway/package.json
RUN npm ci

COPY tsconfig.base.json ./tsconfig.base.json
COPY services/gateway ./services/gateway

RUN npm run build -w services/gateway

WORKDIR /app/services/gateway
USER appuser
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD node -e "fetch('http://localhost:8080/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "run", "start"]

# syntax=docker/dockerfile:1

FROM golang:1.25-alpine AS builder
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api-gateway .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/compliance ./cmd/compliance
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/analytics ./cmd/analytics
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/zeaznode ./cmd/zeaznode

FROM alpine:3.22 AS api-gateway
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=builder /out/api-gateway /app/api-gateway
USER app
EXPOSE 8080
CMD ["/app/api-gateway"]

FROM alpine:3.22 AS compliance
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=builder /out/compliance /app/compliance
USER app
EXPOSE 8082
CMD ["/app/compliance"]


FROM alpine:3.22 AS analytics
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=builder /out/analytics /app/analytics
USER app
CMD ["/app/analytics"]

FROM alpine:3.22 AS zeaz-node
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=builder /out/zeaznode /app/zeaznode
USER app
EXPOSE 8090
CMD ["/app/zeaznode"]

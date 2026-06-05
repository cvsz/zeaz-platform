//go:build integration

package integration

import (
	"context"
	"database/sql"
	"fmt"
	"testing"
	"time"

	_ "github.com/lib/pq"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func TestPostgresContainerLifecycle(t *testing.T) {
	ctx := context.Background()
	req := testcontainers.ContainerRequest{
		Image:        "postgres:16-alpine",
		ExposedPorts: []string{"5432/tcp"},
		Env: map[string]string{
			"POSTGRES_PASSWORD": "postgres",
			"POSTGRES_USER":     "postgres",
			"POSTGRES_DB":       "payments",
		},
		WaitingFor: wait.ForListeningPort("5432/tcp").WithStartupTimeout(60 * time.Second),
	}
	pg, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{ContainerRequest: req, Started: true})
	if err != nil {
		t.Fatalf("start container: %v", err)
	}
	defer func() { _ = pg.Terminate(ctx) }()

	host, err := pg.Host(ctx)
	if err != nil { t.Fatalf("host: %v", err) }
	port, err := pg.MappedPort(ctx, "5432")
	if err != nil { t.Fatalf("port: %v", err) }

	dsn := fmt.Sprintf("postgres://postgres:postgres@%s:%s/payments?sslmode=disable", host, port.Port())
	db, err := sql.Open("postgres", dsn)
	if err != nil { t.Fatalf("open db: %v", err) }
	defer db.Close()

	if _, err := db.ExecContext(ctx, "create table if not exists healthcheck(id int primary key)"); err != nil {
		t.Fatalf("create table: %v", err)
	}
	if _, err := db.ExecContext(ctx, "insert into healthcheck(id) values(1) on conflict do nothing"); err != nil {
		t.Fatalf("insert: %v", err)
	}
	var c int
	if err := db.QueryRowContext(ctx, "select count(*) from healthcheck").Scan(&c); err != nil {
		t.Fatalf("count: %v", err)
	}
	if c < 1 { t.Fatalf("expected row") }
}

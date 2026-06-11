package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	var (
		dsn    = flag.String("dsn", os.Getenv("POSTGRES_DSN"), "PostgreSQL DSN")
		dir    = flag.String("dir", "migrations", "migrations directory")
		action = flag.String("action", "up", "up, down, status, or create")
		name   = flag.String("name", "", "migration name (required for create)")
	)
	flag.Parse()

	if *dsn == "" {
		*dsn = "postgres://postgres:postgres@localhost:5432/game_catalog?sslmode=disable"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, *dsn)
	if err != nil {
		log.Fatalf("connecting to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("pinging database: %v", err)
	}

	switch *action {
	case "up":
		runMigrations(ctx, pool, *dir, "up")
	case "down":
		runMigrations(ctx, pool, *dir, "down")
	case "status":
		showStatus(ctx, pool, *dir)
	case "create":
		if *name == "" {
			log.Fatal("--name is required for create action")
		}
		createMigration(*dir, *name)
	default:
		log.Fatalf("unknown action: %s (use up, down, status, or create)", *action)
	}
}

func ensureSchemaTable(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version     BIGINT PRIMARY KEY,
			filename    TEXT NOT NULL,
			applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			checksum    TEXT NOT NULL DEFAULT '',
			batch       INTEGER NOT NULL DEFAULT 1
		)
	`)
	return err
}

func appliedVersions(ctx context.Context, pool *pgxpool.Pool) (map[int64]bool, error) {
	rows, err := pool.Query(ctx, "SELECT version FROM schema_migrations ORDER BY version")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	applied := make(map[int64]bool)
	for rows.Next() {
		var v int64
		if err := rows.Scan(&v); err != nil {
			return nil, err
		}
		applied[v] = true
	}
	return applied, nil
}

type migrationFile struct {
	Version  int64
	Filename string
	Content  string
	IsUp     bool
}

func listMigrations(dir string) ([]migrationFile, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, fmt.Errorf("reading migrations dir: %w", err)
	}

	var migrations []migrationFile
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".sql") {
			continue
		}
		content, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			return nil, fmt.Errorf("reading %s: %w", e.Name(), err)
		}
		migrations = append(migrations, migrationFile{
			Filename: e.Name(),
			Content:  string(content),
		})
	}

	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Filename < migrations[j].Filename
	})

	for i := range migrations {
		migrations[i].Version = int64(i + 1)
	}

	return migrations, nil
}

func runMigrations(ctx context.Context, pool *pgxpool.Pool, dir, direction string) {
	if err := ensureSchemaTable(ctx, pool); err != nil {
		log.Fatalf("ensuring schema_migrations table: %v", err)
	}

	applied, err := appliedVersions(ctx, pool)
	if err != nil {
		log.Fatalf("reading applied versions: %v", err)
	}

	migrations, err := listMigrations(dir)
	if err != nil {
		log.Fatalf("listing migrations: %v", err)
	}

	var pending int
	for _, m := range migrations {
		if direction == "up" && !applied[m.Version] {
			fmt.Printf("Applying: %s\n", m.Filename)
			if _, err := pool.Exec(ctx, m.Content); err != nil {
				log.Fatalf("applying %s: %v", m.Filename, err)
			}
			if _, err := pool.Exec(ctx,
				"INSERT INTO schema_migrations (version, filename, checksum) VALUES ($1, $2, $3)",
				m.Version, m.Filename, fmt.Sprintf("%d", len(m.Content)),
			); err != nil {
				log.Fatalf("recording %s: %v", m.Filename, err)
			}
			pending++
		}
	}

	if pending == 0 {
		fmt.Println("No pending migrations")
	} else {
		fmt.Printf("Applied %d migration(s)\n", pending)
	}
}

func showStatus(ctx context.Context, pool *pgxpool.Pool, dir string) {
	if err := ensureSchemaTable(ctx, pool); err != nil {
		log.Fatalf("ensuring schema_migrations table: %v", err)
	}

	applied, err := appliedVersions(ctx, pool)
	if err != nil {
		log.Fatalf("reading applied versions: %v", err)
	}

	migrations, err := listMigrations(dir)
	if err != nil {
		log.Fatalf("listing migrations: %v", err)
	}

	fmt.Printf("%-5s  %-50s  %s\n", "Ver", "Migration", "Status")
	fmt.Println(strings.Repeat("-", 80))
	for _, m := range migrations {
		status := "Pending"
		if applied[m.Version] {
			status = "Applied"
		}
		fmt.Printf("%-5d  %-50s  %s\n", m.Version, m.Filename, status)
	}
}

func createMigration(dir, name string) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		log.Fatalf("reading migrations dir: %v", err)
	}
	next := len(entries) + 1
	filename := fmt.Sprintf("%03d_%s.sql", next, strings.ReplaceAll(strings.ToLower(name), " ", "_"))
	path := filepath.Join(dir, filename)

	header := fmt.Sprintf("-- %s\n-- Migration: %s\n\n", filename, name)
	if err := os.WriteFile(path, []byte(header), 0644); err != nil {
		log.Fatalf("creating migration: %v", err)
	}
	fmt.Printf("Created: %s\n", path)
}

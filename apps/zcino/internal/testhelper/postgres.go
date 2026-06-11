//go:build integration

package testhelper

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

const migrationFilePattern = "*.sql"

func runMigrations(ctx context.Context, pool *pgxpool.Pool) error {
	dir := migrationsDir()
	entries, err := os.ReadDir(dir)
	if err != nil {
		return fmt.Errorf("read migrations dir %s: %w", dir, err)
	}

	var files []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".sql") {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files)

	for _, name := range files {
		path := filepath.Join(dir, name)
		content, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", name, err)
		}
		if _, err := pool.Exec(ctx, string(content)); err != nil {
			return fmt.Errorf("execute migration %s: %w", name, err)
		}
	}
	return nil
}

func TruncateTables(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `TRUNCATE TABLE tracking_events, games, providers RESTART IDENTITY CASCADE`)
	return err
}

func TruncateTrackingEvents(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `TRUNCATE TABLE tracking_events RESTART IDENTITY CASCADE`)
	return err
}

package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"game-catalog-service/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type GameRepository interface {
	ListGames(ctx context.Context, filter domain.GameFilter, pagination domain.Pagination) ([]domain.Game, int, error)
	GetGameByID(ctx context.Context, id uuid.UUID) (domain.Game, error)
	ListProviders(ctx context.Context) ([]string, error)
}

type PostgresGameRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresGameRepository(pool *pgxpool.Pool) *PostgresGameRepository {
	return &PostgresGameRepository{pool: pool}
}

func (r *PostgresGameRepository) ListGames(ctx context.Context, filter domain.GameFilter, pagination domain.Pagination) ([]domain.Game, int, error) {
	where, args := buildGameFilters(filter)
	countSQL := "SELECT COUNT(*) FROM games g JOIN providers p ON g.provider_id = p.id" + where

	var total int
	if err := r.pool.QueryRow(ctx, countSQL, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count games: %w", err)
	}

	queryArgs := append(args, pagination.PerPage, pagination.Offset())
	query := `
SELECT g.id, g.name, p.name, g.category, g.rtp, g.volatility, g.thumbnail_url, g.is_active
FROM games g
JOIN providers p ON g.provider_id = p.id` + where + `
ORDER BY p.name ASC, g.name ASC
LIMIT $` + fmt.Sprint(len(args)+1) + ` OFFSET $` + fmt.Sprint(len(args)+2)

	rows, err := r.pool.Query(ctx, query, queryArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("query games: %w", err)
	}
	defer rows.Close()

	games := make([]domain.Game, 0, pagination.PerPage)
	for rows.Next() {
		game, err := scanGame(rows)
		if err != nil {
			return nil, 0, fmt.Errorf("scan game: %w", err)
		}
		games = append(games, game)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("iterate games: %w", err)
	}
	return games, total, nil
}

func (r *PostgresGameRepository) GetGameByID(ctx context.Context, id uuid.UUID) (domain.Game, error) {
	const query = `
SELECT id, name, provider, category, rtp, volatility, thumbnail_url, is_active
FROM (
    SELECT g.id, g.name, p.name AS provider, g.category, g.rtp, g.volatility, g.thumbnail_url, g.is_active
    FROM games g
    JOIN providers p ON g.provider_id = p.id
    WHERE g.id = $1 AND g.is_active = TRUE AND p.is_active = TRUE
) AS active_game`

	game, err := scanGame(r.pool.QueryRow(ctx, query, id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Game{}, domain.ErrNotFound
		}
		return domain.Game{}, fmt.Errorf("get game by id: %w", err)
	}
	return game, nil
}

func (r *PostgresGameRepository) ListProviders(ctx context.Context) ([]string, error) {
	const query = `
SELECT name
FROM providers
WHERE is_active = TRUE
ORDER BY name ASC`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query providers: %w", err)
	}
	defer rows.Close()

	providers := make([]string, 0)
	for rows.Next() {
		var provider string
		if err := rows.Scan(&provider); err != nil {
			return nil, fmt.Errorf("scan provider: %w", err)
		}
		providers = append(providers, provider)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate providers: %w", err)
	}
	return providers, nil
}

func buildGameFilters(filter domain.GameFilter) (string, []any) {
	clauses := []string{"g.is_active = TRUE", "p.is_active = TRUE"}
	args := make([]any, 0, 4)
	argIndex := 1

	if filter.Provider != "" {
		clauses = append(clauses, fmt.Sprintf("p.name = $%d", argIndex))
		args = append(args, filter.Provider)
		argIndex++
	}
	if filter.Category != "" {
		clauses = append(clauses, fmt.Sprintf("g.category = $%d", argIndex))
		args = append(args, filter.Category)
		argIndex++
	}
	if filter.RTPRange != nil {
		if filter.RTPRange.Min != nil {
			clauses = append(clauses, fmt.Sprintf("g.rtp >= $%d", argIndex))
			args = append(args, *filter.RTPRange.Min)
			argIndex++
		}
		if filter.RTPRange.Max != nil {
			clauses = append(clauses, fmt.Sprintf("g.rtp <= $%d", argIndex))
			args = append(args, *filter.RTPRange.Max)
			argIndex++
		}
	}

	return " WHERE " + strings.Join(clauses, " AND "), args
}

type gameScanner interface {
	Scan(dest ...any) error
}

func scanGame(scanner gameScanner) (domain.Game, error) {
	var game domain.Game
	if err := scanner.Scan(
		&game.ID,
		&game.Name,
		&game.Provider,
		&game.Category,
		&game.RTP,
		&game.Volatility,
		&game.ThumbnailURL,
		&game.IsActive,
	); err != nil {
		return domain.Game{}, err
	}
	return game, nil
}

package cache

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"game-catalog-service/internal/domain"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type GameCache interface {
	GetGame(ctx context.Context, id uuid.UUID) (domain.Game, bool, error)
	SetGame(ctx context.Context, game domain.Game) error
	GetGamePage(ctx context.Context, filter domain.GameFilter, pagination domain.Pagination) (domain.Page[domain.Game], bool, error)
	SetGamePage(ctx context.Context, filter domain.GameFilter, pagination domain.Pagination, page domain.Page[domain.Game]) error
	GetProviders(ctx context.Context) ([]string, bool, error)
	SetProviders(ctx context.Context, providers []string) error
}

type RedisGameCache struct {
	client *redis.Client
	ttl    time.Duration
}

func NewRedisGameCache(client *redis.Client, ttl time.Duration) *RedisGameCache {
	return &RedisGameCache{client: client, ttl: ttl}
}

func (c *RedisGameCache) GetGame(ctx context.Context, id uuid.UUID) (domain.Game, bool, error) {
	var game domain.Game
	hit, err := c.getJSON(ctx, gameKey(id), &game)
	return game, hit, err
}

func (c *RedisGameCache) SetGame(ctx context.Context, game domain.Game) error {
	return c.setJSON(ctx, gameKey(game.ID), game)
}

func (c *RedisGameCache) GetGamePage(ctx context.Context, filter domain.GameFilter, pagination domain.Pagination) (domain.Page[domain.Game], bool, error) {
	var page domain.Page[domain.Game]
	hit, err := c.getJSON(ctx, gamesKey(filter, pagination), &page)
	return page, hit, err
}

func (c *RedisGameCache) SetGamePage(ctx context.Context, filter domain.GameFilter, pagination domain.Pagination, page domain.Page[domain.Game]) error {
	return c.setJSON(ctx, gamesKey(filter, pagination), page)
}

func (c *RedisGameCache) GetProviders(ctx context.Context) ([]string, bool, error) {
	var providers []string
	hit, err := c.getJSON(ctx, providersKey(), &providers)
	return providers, hit, err
}

func (c *RedisGameCache) SetProviders(ctx context.Context, providers []string) error {
	return c.setJSON(ctx, providersKey(), providers)
}

func (c *RedisGameCache) getJSON(ctx context.Context, key string, dest any) (bool, error) {
	payload, err := c.client.Get(ctx, key).Bytes()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return false, nil
		}
		return false, fmt.Errorf("redis get %s: %w", key, err)
	}
	if err := json.Unmarshal(payload, dest); err != nil {
		return false, fmt.Errorf("unmarshal redis value %s: %w", key, err)
	}
	return true, nil
}

func (c *RedisGameCache) setJSON(ctx context.Context, key string, value any) error {
	payload, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("marshal redis value %s: %w", key, err)
	}
	if err := c.client.Set(ctx, key, payload, c.ttl).Err(); err != nil {
		return fmt.Errorf("redis set %s: %w", key, err)
	}
	return nil
}

func gameKey(id uuid.UUID) string {
	return "game-catalog:game:" + id.String()
}

func providersKey() string {
	return "game-catalog:providers"
}

func gamesKey(filter domain.GameFilter, pagination domain.Pagination) string {
	payload, _ := json.Marshal(struct {
		Filter     domain.GameFilter `json:"filter"`
		Pagination domain.Pagination `json:"pagination"`
	}{Filter: filter, Pagination: pagination})
	sum := sha256.Sum256(payload)
	return "game-catalog:games:" + hex.EncodeToString(sum[:])
}

//go:build integration

package testhelper

import (
	"context"

	"github.com/redis/go-redis/v9"
)

func FlushRedis(ctx context.Context, client *redis.Client) error {
	return client.FlushDB(ctx).Err()
}

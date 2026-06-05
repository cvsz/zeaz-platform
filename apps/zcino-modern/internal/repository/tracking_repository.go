package repository

import (
	"context"
	"encoding/json"
	"fmt"

	"game-catalog-service/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TrackingRepository interface {
	InsertTrackingEvents(ctx context.Context, events []domain.TrackingEvent) error
}

type PostgresTrackingRepository struct {
	pool *pgxpool.Pool
}

var trackingEventColumns = []string{
	"id",
	"tenant_id",
	"event_type",
	"game_id",
	"session_id",
	"user_id",
	"provider",
	"country",
	"placement",
	"click_target",
	"affiliate_id",
	"campaign_id",
	"referrer_url",
	"session_duration_ms",
	"occurred_at",
	"received_at",
	"metadata",
}

func NewPostgresTrackingRepository(pool *pgxpool.Pool) *PostgresTrackingRepository {
	return &PostgresTrackingRepository{pool: pool}
}

func (r *PostgresTrackingRepository) InsertTrackingEvents(ctx context.Context, events []domain.TrackingEvent) error {
	if len(events) == 0 {
		return nil
	}
	rows := make([][]any, 0, len(events))
	for _, event := range events {
		row, err := trackingEventCopyRow(event)
		if err != nil {
			return err
		}
		rows = append(rows, row)
	}

	_, err := r.pool.CopyFrom(ctx,
		pgx.Identifier{"tracking_events"},
		trackingEventColumns,
		pgx.CopyFromRows(rows),
	)
	if err != nil {
		return fmt.Errorf("copy tracking events: %w", err)
	}
	return nil
}

func trackingEventCopyRow(event domain.TrackingEvent) ([]any, error) {
	metadata, err := json.Marshal(metadataOrEmpty(event.Metadata))
	if err != nil {
		return nil, fmt.Errorf("marshal tracking metadata: %w", err)
	}
	return []any{
		event.ID,
		event.TenantID,
		string(event.Type),
		event.GameID,
		event.SessionID,
		nullString(event.UserID),
		nullString(event.Provider),
		nullString(event.Country),
		nullString(event.Placement),
		nullString(event.ClickTarget),
		nullString(event.AffiliateID),
		nullString(event.CampaignID),
		nullString(event.ReferrerURL),
		nullInt64(event.SessionDurationMS),
		event.OccurredAt,
		event.ReceivedAt,
		metadata,
	}, nil
}

func nullString(value string) any {
	if value == "" {
		return nil
	}
	return &value
}

func nullInt64(value *int64) any {
	if value == nil {
		return nil
	}
	return *value
}

func metadataOrEmpty(metadata map[string]string) map[string]string {
	if metadata == nil {
		return map[string]string{}
	}
	return metadata
}

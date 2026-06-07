// Package provider normalizes upstream game provider APIs into the catalog domain model.
package provider

import (
	"fmt"
	"net/url"
	"strings"

	"game-catalog-service/internal/domain"

	"github.com/google/uuid"
)

// Game is the normalized catalog shape returned by every provider adapter.
type Game = domain.Game

// Provider is the common adapter interface implemented by every game provider.
type Provider interface {
	GetGames() ([]Game, error)
}

const (
	PGSoftProvider        = "PG Soft"
	PragmaticPlayProvider = "Pragmatic Play"
	EvolutionProvider     = "Evolution"
)

// RawGame is a provider-neutral DTO used by adapters before final catalog normalization.
type RawGame struct {
	Provider     string
	ExternalID   string
	Name         string
	Category     string
	RTP          float64
	Volatility   string
	ThumbnailURL string
	IsActive     bool
}

// NormalizeGame converts a provider-neutral DTO into the canonical domain.Game shape.
func NormalizeGame(raw RawGame) (Game, error) {
	provider := strings.TrimSpace(raw.Provider)
	externalID := strings.TrimSpace(raw.ExternalID)
	if provider == "" {
		return Game{}, fmt.Errorf("provider is required")
	}
	if externalID == "" {
		return Game{}, fmt.Errorf("external_id is required for %s", provider)
	}

	game := Game{
		ID:           stableGameID(provider, externalID),
		Name:         strings.TrimSpace(raw.Name),
		Provider:     provider,
		Category:     normalizeCategory(raw.Category),
		RTP:          normalizeRTP(raw.RTP),
		Volatility:   normalizeVolatility(raw.Volatility),
		ThumbnailURL: normalizeThumbnailURL(raw.ThumbnailURL),
		IsActive:     raw.IsActive,
	}
	if err := game.Validate(); err != nil {
		return Game{}, fmt.Errorf("normalize %s/%s: %w", provider, externalID, err)
	}
	return game, nil
}

func stableGameID(provider, externalID string) uuid.UUID {
	key := strings.ToLower(strings.TrimSpace(provider)) + ":" + strings.ToLower(strings.TrimSpace(externalID))
	return uuid.NewSHA1(uuid.NameSpaceURL, []byte(key))
}

func normalizeCategory(category string) string {
	switch strings.ToLower(strings.TrimSpace(category)) {
	case "slot", "slots", "video_slot", "video slots", "video-slots":
		return "slots"
	case "live", "live casino", "live_casino", "live-casino", "table", "tables":
		return "live-casino"
	default:
		if strings.TrimSpace(category) == "" {
			return "other"
		}
		return strings.ToLower(strings.ReplaceAll(strings.TrimSpace(category), " ", "-"))
	}
}

func normalizeRTP(rtp float64) float64 {
	if rtp > 0 && rtp <= 1 {
		return rtp * 100
	}
	return rtp
}

func normalizeVolatility(volatility string) domain.Volatility {
	switch strings.ToLower(strings.TrimSpace(volatility)) {
	case "low", "1", "l":
		return domain.VolatilityLow
	case "high", "3", "h":
		return domain.VolatilityHigh
	default:
		return domain.VolatilityMedium
	}
}

func normalizeThumbnailURL(thumbnailURL string) string {
	thumbnailURL = strings.TrimSpace(thumbnailURL)
	if thumbnailURL == "" {
		return "https://cdn.zcino.local/games/placeholder.png"
	}
	if parsed, err := url.Parse(thumbnailURL); err == nil && parsed.Scheme != "" && parsed.Host != "" {
		return thumbnailURL
	}
	return "https://cdn.zcino.local/" + strings.TrimLeft(thumbnailURL, "/")
}

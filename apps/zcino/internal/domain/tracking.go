package domain

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

type TrackingEventType string

const (
	TrackingEventImpression TrackingEventType = "impression"
	TrackingEventClick      TrackingEventType = "click"
)

func (t TrackingEventType) IsValid() bool {
	switch t {
	case TrackingEventImpression, TrackingEventClick:
		return true
	default:
		return false
	}
}

type TrackingEvent struct {
	ID                uuid.UUID         `json:"id"`
	TenantID          string            `json:"tenant_id"`
	Type              TrackingEventType `json:"type"`
	GameID            uuid.UUID         `json:"game_id"`
	SessionID         string            `json:"session_id"`
	UserID            string            `json:"user_id,omitempty"`
	Provider          string            `json:"provider,omitempty"`
	Country           string            `json:"country,omitempty"`
	Placement         string            `json:"placement,omitempty"`
	ClickTarget       string            `json:"click_target,omitempty"`
	AffiliateID       string            `json:"affiliate_id,omitempty"`
	CampaignID        string            `json:"campaign_id,omitempty"`
	ReferrerURL       string            `json:"referrer_url,omitempty"`
	SessionDurationMS *int64            `json:"session_duration_ms,omitempty"`
	OccurredAt        time.Time         `json:"occurred_at"`
	ReceivedAt        time.Time         `json:"received_at"`
	Metadata          map[string]string `json:"metadata,omitempty"`
}

func (e TrackingEvent) Validate() error {
	if e.ID == uuid.Nil {
		return errors.New("id is required")
	}
	if strings.TrimSpace(e.TenantID) == "" {
		return errors.New("tenant_id is required")
	}
	if len(e.TenantID) > 100 {
		return errors.New("tenant_id must be at most 100 characters")
	}
	if !e.Type.IsValid() {
		return fmt.Errorf("type must be one of %q or %q", TrackingEventImpression, TrackingEventClick)
	}
	if e.GameID == uuid.Nil {
		return errors.New("game_id is required")
	}
	if strings.TrimSpace(e.SessionID) == "" {
		return errors.New("session_id is required")
	}
	if len(e.SessionID) > 128 {
		return errors.New("session_id must be at most 128 characters")
	}
	if e.UserID != "" && len(e.UserID) > 128 {
		return errors.New("user_id must be at most 128 characters")
	}
	if e.Provider != "" && len(e.Provider) > 100 {
		return errors.New("provider must be at most 100 characters")
	}
	if e.Country != "" && len(e.Country) > 2 {
		return errors.New("country must be an ISO 3166-1 alpha-2 code")
	}
	if e.Placement != "" && len(e.Placement) > 100 {
		return errors.New("placement must be at most 100 characters")
	}
	if e.ClickTarget != "" && len(e.ClickTarget) > 100 {
		return errors.New("click_target must be at most 100 characters")
	}
	if e.AffiliateID != "" && len(e.AffiliateID) > 128 {
		return errors.New("affiliate_id must be at most 128 characters")
	}
	if e.CampaignID != "" && len(e.CampaignID) > 128 {
		return errors.New("campaign_id must be at most 128 characters")
	}
	if e.Country != "" && len(e.Country) != 2 {
		return errors.New("country must be an ISO 3166-1 alpha-2 code")
	}
	if e.ReferrerURL != "" && len(e.ReferrerURL) > 2048 {
		return errors.New("referrer_url must be at most 2048 characters")
	}
	if e.Type == TrackingEventImpression && e.ClickTarget != "" {
		return errors.New("click_target is only valid for click events")
	}
	if e.SessionDurationMS != nil && *e.SessionDurationMS < 0 {
		return errors.New("session_duration_ms must be greater than or equal to zero")
	}
	if e.OccurredAt.IsZero() {
		return errors.New("occurred_at is required")
	}
	if e.ReceivedAt.IsZero() {
		return errors.New("received_at is required")
	}
	if len(e.Metadata) > 50 {
		return errors.New("metadata must contain at most 50 entries")
	}
	for key, value := range e.Metadata {
		if strings.TrimSpace(key) == "" {
			return errors.New("metadata keys must not be blank")
		}
		if len(key) > 100 {
			return errors.New("metadata keys must be at most 100 characters")
		}
		if len(value) > 500 {
			return errors.New("metadata values must be at most 500 characters")
		}
	}
	return nil
}

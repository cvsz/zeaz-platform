package events

import "time"

const ClickEventsSubject = "click.events"

type ClickEvent struct {
	TenantID  string    `json:"tenant_id"`
	GameID    string    `json:"game_id"`
	UserID    string    `json:"user_id,omitempty"`
	Country   string    `json:"country,omitempty"`
	SessionID string    `json:"session_id"`
	Time      int64     `json:"time"`
	Timestamp time.Time `json:"timestamp"`
}

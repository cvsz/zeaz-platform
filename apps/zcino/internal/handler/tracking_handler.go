package handler

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"time"

	"game-catalog-service/internal/domain"
	"game-catalog-service/internal/middleware"
	"game-catalog-service/internal/service"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type TrackingHandler struct {
	service service.TrackingService
	log     *zap.Logger
}

type TrackingRequest struct {
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
	OccurredAt        *time.Time        `json:"occurred_at,omitempty"`
	Metadata          map[string]string `json:"metadata,omitempty"`
}

type TrackingAcceptedResponse struct {
	ID     uuid.UUID                `json:"id"`
	Status string                   `json:"status"`
	Schema TrackingAcceptedSchema   `json:"schema"`
	Event  domain.TrackingEventType `json:"event"`
}

type TrackingAcceptedSchema struct {
	Name    string `json:"name"`
	Version int    `json:"version"`
}

func NewTrackingHandler(service service.TrackingService, log *zap.Logger) *TrackingHandler {
	return &TrackingHandler{service: service, log: log}
}

func (h *TrackingHandler) TrackImpression(w http.ResponseWriter, r *http.Request) {
	h.track(w, r, domain.TrackingEventImpression)
}

func (h *TrackingHandler) TrackClick(w http.ResponseWriter, r *http.Request) {
	h.track(w, r, domain.TrackingEventClick)
}

func (h *TrackingHandler) track(w http.ResponseWriter, r *http.Request, eventType domain.TrackingEventType) {
	request, err := decodeTrackingRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}

	eventID := uuid.New()
	event := request.toEvent(eventID, middleware.TenantID(r.Context()), eventType, time.Now().UTC())
	if err := h.service.Track(r.Context(), event); err != nil {
		h.handleTrackingError(w, err)
		return
	}

	writeJSON(w, http.StatusAccepted, TrackingAcceptedResponse{
		ID:     eventID,
		Status: "queued",
		Schema: TrackingAcceptedSchema{Name: "tracking_event", Version: 1},
		Event:  eventType,
	})
}

func (h *TrackingHandler) handleTrackingError(w http.ResponseWriter, err error) {
	if errors.Is(err, domain.ErrValidation) {
		writeError(w, http.StatusBadRequest, "validation_failed", err.Error())
		return
	}
	if errors.Is(err, service.ErrTrackingQueueFull) {
		writeError(w, http.StatusServiceUnavailable, "queue_full", "tracking queue is full")
		return
	}
	h.log.Error("tracking request failed", zap.Error(err))
	writeError(w, http.StatusInternalServerError, "internal_server_error", "internal server error")
}

func decodeTrackingRequest(r *http.Request) (TrackingRequest, error) {
	defer r.Body.Close()
	decoder := json.NewDecoder(io.LimitReader(r.Body, 1<<20))
	decoder.DisallowUnknownFields()
	var request TrackingRequest
	if err := decoder.Decode(&request); err != nil {
		return TrackingRequest{}, err
	}
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		return TrackingRequest{}, errors.New("request body must contain a single JSON object")
	}
	return request, nil
}

func (r TrackingRequest) toEvent(id uuid.UUID, tenantID string, eventType domain.TrackingEventType, receivedAt time.Time) domain.TrackingEvent {
	occurredAt := receivedAt
	if r.OccurredAt != nil {
		occurredAt = r.OccurredAt.UTC()
	}
	return domain.TrackingEvent{
		ID:                id,
		TenantID:          tenantID,
		Type:              eventType,
		GameID:            r.GameID,
		SessionID:         strings.TrimSpace(r.SessionID),
		UserID:            strings.TrimSpace(r.UserID),
		Provider:          strings.TrimSpace(r.Provider),
		Country:           strings.ToUpper(strings.TrimSpace(r.Country)),
		Placement:         strings.TrimSpace(r.Placement),
		ClickTarget:       strings.TrimSpace(r.ClickTarget),
		AffiliateID:       strings.TrimSpace(r.AffiliateID),
		CampaignID:        strings.TrimSpace(r.CampaignID),
		ReferrerURL:       strings.TrimSpace(r.ReferrerURL),
		SessionDurationMS: r.SessionDurationMS,
		OccurredAt:        occurredAt,
		ReceivedAt:        receivedAt,
		Metadata:          r.Metadata,
	}
}

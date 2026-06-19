package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"game-catalog-service/internal/domain"
	"game-catalog-service/internal/service"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type CatalogHandler struct {
	service  service.CatalogService
	validate *validator.Validate
	log      *zap.Logger
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

func NewCatalogHandler(service service.CatalogService, validate *validator.Validate, log *zap.Logger) *CatalogHandler {
	return &CatalogHandler{service: service, validate: validate, log: log}
}

func (h *CatalogHandler) ListGames(w http.ResponseWriter, r *http.Request) {
	filter, pagination, err := parseListGamesQuery(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}

	page, err := h.service.ListGames(r.Context(), filter, pagination)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, page)
}

func (h *CatalogHandler) GetGame(w http.ResponseWriter, r *http.Request) {
	idValue := r.PathValue("id")
	id, err := uuid.Parse(idValue)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", "id must be a valid uuid")
		return
	}

	game, err := h.service.GetGame(r.Context(), id)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, game)
}

func (h *CatalogHandler) ListProviders(w http.ResponseWriter, r *http.Request) {
	providers, err := h.service.ListProviders(r.Context())
	if err != nil {
		h.handleServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string][]string{"providers": providers})
}

func (h *CatalogHandler) handleServiceError(w http.ResponseWriter, err error) {
	if errors.Is(err, domain.ErrValidation) {
		writeError(w, http.StatusBadRequest, "validation_failed", err.Error())
		return
	}
	if errors.Is(err, domain.ErrNotFound) {
		writeError(w, http.StatusNotFound, "not_found", "resource not found")
		return
	}
	h.log.Error("request failed", zap.Error(err))
	writeError(w, http.StatusInternalServerError, "internal_server_error", "internal server error")
}

func parseListGamesQuery(r *http.Request) (domain.GameFilter, domain.Pagination, error) {
	query := r.URL.Query()
	filter := domain.GameFilter{
		Provider: strings.TrimSpace(query.Get("provider")),
		Category: strings.TrimSpace(query.Get("category")),
	}

	rtpRange, err := parseRTPRange(query.Get("rtp_range"), query.Get("rtp_min"), query.Get("rtp_max"))
	if err != nil {
		return domain.GameFilter{}, domain.Pagination{}, err
	}
	filter.RTPRange = rtpRange

	page, err := parsePositiveInt(query.Get("page"), 1, "page")
	if err != nil {
		return domain.GameFilter{}, domain.Pagination{}, err
	}
	perPage, err := parsePositiveInt(query.Get("per_page"), 20, "per_page")
	if err != nil {
		return domain.GameFilter{}, domain.Pagination{}, err
	}

	return filter, domain.Pagination{Page: page, PerPage: perPage}, nil
}

func parseRTPRange(rangeValue, minValue, maxValue string) (*domain.RTPRange, error) {
	if rangeValue == "" && minValue == "" && maxValue == "" {
		return nil, nil
	}
	rtpRange := &domain.RTPRange{}
	if rangeValue != "" {
		parts := strings.Split(rangeValue, "-")
		if len(parts) != 2 {
			return nil, fmt.Errorf("rtp_range must use min-max format, for example 94-98")
		}
		minValue = strings.TrimSpace(parts[0])
		maxValue = strings.TrimSpace(parts[1])
	}
	if minValue != "" {
		min, err := strconv.ParseFloat(minValue, 64)
		if err != nil {
			return nil, fmt.Errorf("rtp minimum must be a number")
		}
		rtpRange.Min = &min
	}
	if maxValue != "" {
		max, err := strconv.ParseFloat(maxValue, 64)
		if err != nil {
			return nil, fmt.Errorf("rtp maximum must be a number")
		}
		rtpRange.Max = &max
	}
	return rtpRange, nil
}

func parsePositiveInt(value string, fallback int, field string) (int, error) {
	if value == "" {
		return fallback, nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed <= 0 {
		return 0, fmt.Errorf("%s must be a positive integer", field)
	}
	return parsed, nil
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, ErrorResponse{Error: code, Message: message})
}

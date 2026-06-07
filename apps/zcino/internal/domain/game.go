package domain

import (
	"errors"
	"fmt"
	"net/url"
	"strings"

	"github.com/google/uuid"
)

type Volatility string

const (
	VolatilityLow    Volatility = "low"
	VolatilityMedium Volatility = "medium"
	VolatilityHigh   Volatility = "high"
)

func (v Volatility) IsValid() bool {
	switch v {
	case VolatilityLow, VolatilityMedium, VolatilityHigh:
		return true
	default:
		return false
	}
}

type Game struct {
	ID           uuid.UUID  `json:"id"`
	Name         string     `json:"name"`
	Provider     string     `json:"provider"`
	Category     string     `json:"category"`
	RTP          float64    `json:"rtp"`
	Volatility   Volatility `json:"volatility"`
	ThumbnailURL string     `json:"thumbnail_url"`
	IsActive     bool       `json:"is_active"`
}

func (g Game) Validate() error {
	if g.ID == uuid.Nil {
		return errors.New("id is required")
	}
	if strings.TrimSpace(g.Name) == "" {
		return errors.New("name is required")
	}
	if strings.TrimSpace(g.Provider) == "" {
		return errors.New("provider is required")
	}
	if strings.TrimSpace(g.Category) == "" {
		return errors.New("category is required")
	}
	if g.RTP < 0 || g.RTP > 100 {
		return fmt.Errorf("rtp must be between 0 and 100")
	}
	if !g.Volatility.IsValid() {
		return fmt.Errorf("invalid volatility %q", g.Volatility)
	}
	if _, err := url.ParseRequestURI(g.ThumbnailURL); err != nil {
		return fmt.Errorf("thumbnail_url must be valid: %w", err)
	}
	return nil
}

type RTPRange struct {
	Min *float64 `json:"min,omitempty"`
	Max *float64 `json:"max,omitempty"`
}

type GameFilter struct {
	Provider string    `json:"provider,omitempty" validate:"omitempty,min=1,max=100"`
	Category string    `json:"category,omitempty" validate:"omitempty,min=1,max=100"`
	RTPRange *RTPRange `json:"rtp_range,omitempty"`
}

type Pagination struct {
	Page    int `json:"page" validate:"min=1,max=100000"`
	PerPage int `json:"per_page" validate:"min=1,max=100"`
}

func (p Pagination) Offset() int {
	return (p.Page - 1) * p.PerPage
}

type Page[T any] struct {
	Items      []T `json:"items"`
	Page       int `json:"page"`
	PerPage    int `json:"per_page"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

func NewPage[T any](items []T, pagination Pagination, total int) Page[T] {
	totalPages := 0
	if pagination.PerPage > 0 && total > 0 {
		totalPages = (total + pagination.PerPage - 1) / pagination.PerPage
	}
	return Page[T]{
		Items:      items,
		Page:       pagination.Page,
		PerPage:    pagination.PerPage,
		Total:      total,
		TotalPages: totalPages,
	}
}

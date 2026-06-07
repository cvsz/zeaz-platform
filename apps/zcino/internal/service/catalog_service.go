package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"game-catalog-service/internal/cache"
	"game-catalog-service/internal/domain"
	"game-catalog-service/internal/repository"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type CatalogService interface {
	ListGames(ctx context.Context, filter domain.GameFilter, pagination domain.Pagination) (domain.Page[domain.Game], error)
	GetGame(ctx context.Context, id uuid.UUID) (domain.Game, error)
	ListProviders(ctx context.Context) ([]string, error)
}

type catalogService struct {
	repo     repository.GameRepository
	cache    cache.GameCache
	validate *validator.Validate
	log      *zap.Logger
}

func NewCatalogService(repo repository.GameRepository, cache cache.GameCache, validate *validator.Validate, log *zap.Logger) CatalogService {
	return &catalogService{repo: repo, cache: cache, validate: validate, log: log}
}

func (s *catalogService) ListGames(ctx context.Context, filter domain.GameFilter, pagination domain.Pagination) (domain.Page[domain.Game], error) {
	filter.Provider = strings.TrimSpace(filter.Provider)
	filter.Category = strings.TrimSpace(filter.Category)
	if err := s.validateFilter(filter); err != nil {
		return domain.Page[domain.Game]{}, err
	}
	if pagination.Page == 0 {
		pagination.Page = 1
	}
	if pagination.PerPage == 0 {
		pagination.PerPage = 20
	}
	if err := s.validate.Struct(pagination); err != nil {
		return domain.Page[domain.Game]{}, domain.ValidationError{Message: fmt.Sprintf("invalid pagination: %v", err)}
	}

	if cached, ok, err := s.cache.GetGamePage(ctx, filter, pagination); err == nil && ok {
		return cached, nil
	} else if err != nil {
		s.log.Warn("game page cache read failed", zap.Error(err))
	}

	games, total, err := s.repo.ListGames(ctx, filter, pagination)
	if err != nil {
		return domain.Page[domain.Game]{}, err
	}
	page := domain.NewPage(games, pagination, total)
	if err := s.cache.SetGamePage(ctx, filter, pagination, page); err != nil {
		s.log.Warn("game page cache write failed", zap.Error(err))
	}
	return page, nil
}

func (s *catalogService) GetGame(ctx context.Context, id uuid.UUID) (domain.Game, error) {
	if id == uuid.Nil {
		return domain.Game{}, domain.ValidationError{Message: "id is required"}
	}
	if cached, ok, err := s.cache.GetGame(ctx, id); err == nil && ok {
		return cached, nil
	} else if err != nil {
		s.log.Warn("game cache read failed", zap.String("game_id", id.String()), zap.Error(err))
	}

	game, err := s.repo.GetGameByID(ctx, id)
	if err != nil {
		return domain.Game{}, err
	}
	if err := s.cache.SetGame(ctx, game); err != nil {
		s.log.Warn("game cache write failed", zap.String("game_id", id.String()), zap.Error(err))
	}
	return game, nil
}

func (s *catalogService) ListProviders(ctx context.Context) ([]string, error) {
	if cached, ok, err := s.cache.GetProviders(ctx); err == nil && ok {
		return cached, nil
	} else if err != nil {
		s.log.Warn("providers cache read failed", zap.Error(err))
	}
	providers, err := s.repo.ListProviders(ctx)
	if err != nil {
		return nil, err
	}
	if err := s.cache.SetProviders(ctx, providers); err != nil {
		s.log.Warn("providers cache write failed", zap.Error(err))
	}
	return providers, nil
}

func (s *catalogService) validateFilter(filter domain.GameFilter) error {
	if err := s.validate.Struct(filter); err != nil {
		return domain.ValidationError{Message: fmt.Sprintf("invalid filter: %v", err)}
	}
	if filter.RTPRange == nil {
		return nil
	}
	if filter.RTPRange.Min != nil && (*filter.RTPRange.Min < 0 || *filter.RTPRange.Min > 100) {
		return domain.ValidationError{Message: "rtp_range minimum must be between 0 and 100"}
	}
	if filter.RTPRange.Max != nil && (*filter.RTPRange.Max < 0 || *filter.RTPRange.Max > 100) {
		return domain.ValidationError{Message: "rtp_range maximum must be between 0 and 100"}
	}
	if filter.RTPRange.Min != nil && filter.RTPRange.Max != nil && *filter.RTPRange.Min > *filter.RTPRange.Max {
		return domain.ValidationError{Message: "rtp_range minimum cannot exceed maximum"}
	}
	return nil
}

func IsNotFound(err error) bool {
	return errors.Is(err, domain.ErrNotFound)
}

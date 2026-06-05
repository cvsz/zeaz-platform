package service

import (
	"context"
	"testing"

	"game-catalog-service/internal/domain"
	"game-catalog-service/internal/repository"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type noopCache struct{}

func (noopCache) GetGame(context.Context, uuid.UUID) (domain.Game, bool, error) {
	return domain.Game{}, false, nil
}
func (noopCache) SetGame(context.Context, domain.Game) error { return nil }
func (noopCache) GetGamePage(context.Context, domain.GameFilter, domain.Pagination) (domain.Page[domain.Game], bool, error) {
	return domain.Page[domain.Game]{}, false, nil
}
func (noopCache) SetGamePage(context.Context, domain.GameFilter, domain.Pagination, domain.Page[domain.Game]) error {
	return nil
}
func (noopCache) GetProviders(context.Context) ([]string, bool, error) { return nil, false, nil }
func (noopCache) SetProviders(context.Context, []string) error         { return nil }

type fakeRepo struct {
	repository.GameRepository
}

func (fakeRepo) ListGames(context.Context, domain.GameFilter, domain.Pagination) ([]domain.Game, int, error) {
	return []domain.Game{}, 0, nil
}

func TestCatalogServiceRejectsInvalidRTPRange(t *testing.T) {
	svc := NewCatalogService(fakeRepo{}, noopCache{}, validator.New(), zap.NewNop())
	min, max := 99.0, 90.0
	_, err := svc.ListGames(context.Background(), domain.GameFilter{RTPRange: &domain.RTPRange{Min: &min, Max: &max}}, domain.Pagination{Page: 1, PerPage: 20})
	if err == nil {
		t.Fatal("expected validation error")
	}
}

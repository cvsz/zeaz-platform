package provider

import (
	"testing"

	"game-catalog-service/internal/domain"
)

func TestMockProvidersNormalizeToCanonicalCatalog(t *testing.T) {
	normalizer := NewNormalizer(
		NewMockPGSoftProvider(),
		NewMockPragmaticPlayProvider(),
		NewMockEvolutionProvider(),
	)

	games, err := normalizer.GetGames()
	if err != nil {
		t.Fatalf("GetGames() error = %v", err)
	}
	if got, want := len(games), 6; got != want {
		t.Fatalf("len(games) = %d, want %d", got, want)
	}

	providers := map[string]bool{}
	for _, game := range games {
		if err := game.Validate(); err != nil {
			t.Fatalf("normalized game did not validate: %v", err)
		}
		providers[game.Provider] = true
	}

	for _, want := range []string{PGSoftProvider, PragmaticPlayProvider, EvolutionProvider} {
		if !providers[want] {
			t.Fatalf("provider %q missing from normalized catalog", want)
		}
	}
}

func TestNormalizeGameConvertsProviderFields(t *testing.T) {
	game, err := NormalizeGame(RawGame{
		Provider:     PragmaticPlayProvider,
		ExternalID:   "pp-test",
		Name:         "Test Slot",
		Category:     "video_slot",
		RTP:          0.965,
		Volatility:   "3",
		ThumbnailURL: "/provider/test-slot.png",
		IsActive:     true,
	})
	if err != nil {
		t.Fatalf("NormalizeGame() error = %v", err)
	}
	if game.Category != "slots" {
		t.Fatalf("Category = %q, want slots", game.Category)
	}
	if game.RTP != 96.5 {
		t.Fatalf("RTP = %v, want 96.5", game.RTP)
	}
	if game.Volatility != domain.VolatilityHigh {
		t.Fatalf("Volatility = %q, want %q", game.Volatility, domain.VolatilityHigh)
	}
	if game.ThumbnailURL != "https://cdn.zcino.local/provider/test-slot.png" {
		t.Fatalf("ThumbnailURL = %q", game.ThumbnailURL)
	}
}

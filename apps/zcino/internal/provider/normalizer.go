package provider

import "fmt"

// Normalizer fetches games from multiple provider adapters and emits one canonical catalog.
type Normalizer struct {
	providers []Provider
}

// NewNormalizer builds a normalization layer around one or more provider adapters.
func NewNormalizer(providers ...Provider) *Normalizer {
	return &Normalizer{providers: providers}
}

// GetGames returns a de-duplicated catalog across all configured provider adapters.
func (n *Normalizer) GetGames() ([]Game, error) {
	seen := make(map[string]struct{})
	games := make([]Game, 0)
	for _, provider := range n.providers {
		providerGames, err := provider.GetGames()
		if err != nil {
			return nil, fmt.Errorf("provider get games: %w", err)
		}
		for _, game := range providerGames {
			if err := game.Validate(); err != nil {
				return nil, fmt.Errorf("normalized game %s validation failed: %w", game.ID, err)
			}
			key := game.Provider + ":" + game.ID.String()
			if _, ok := seen[key]; ok {
				continue
			}
			seen[key] = struct{}{}
			games = append(games, game)
		}
	}
	return games, nil
}

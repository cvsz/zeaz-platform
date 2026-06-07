package provider

// PGSoftGame mirrors a small slice of PG Soft-style API data.
type PGSoftGame struct {
	GameID   string
	Title    string
	GameType string
	RTPPct   float64
	Risk     string
	Icon     string
	Enabled  bool
}

// PGSoftAdapter adapts PG Soft API responses to the common Provider interface.
type PGSoftAdapter struct {
	games []PGSoftGame
}

func NewMockPGSoftProvider() Provider {
	return PGSoftAdapter{games: []PGSoftGame{
		{GameID: "pg-mahjong-ways", Title: "Mahjong Ways", GameType: "slot", RTPPct: 96.92, Risk: "medium", Icon: "pgsoft/mahjong-ways.png", Enabled: true},
		{GameID: "pg-fortune-tiger", Title: "Fortune Tiger", GameType: "slots", RTPPct: 96.81, Risk: "high", Icon: "https://cdn.pgsoft.example/fortune-tiger.png", Enabled: true},
	}}
}

func (a PGSoftAdapter) GetGames() ([]Game, error) {
	games := make([]Game, 0, len(a.games))
	for _, raw := range a.games {
		game, err := NormalizeGame(RawGame{
			Provider:     PGSoftProvider,
			ExternalID:   raw.GameID,
			Name:         raw.Title,
			Category:     raw.GameType,
			RTP:          raw.RTPPct,
			Volatility:   raw.Risk,
			ThumbnailURL: raw.Icon,
			IsActive:     raw.Enabled,
		})
		if err != nil {
			return nil, err
		}
		games = append(games, game)
	}
	return games, nil
}

// PragmaticGame mirrors a small slice of Pragmatic Play-style API data.
type PragmaticGame struct {
	ID        string
	GameName  string
	Product   string
	Payout    float64
	Variance  int
	ImagePath string
	Status    string
}

// PragmaticPlayAdapter adapts Pragmatic Play API responses to the common Provider interface.
type PragmaticPlayAdapter struct {
	games []PragmaticGame
}

func NewMockPragmaticPlayProvider() Provider {
	return PragmaticPlayAdapter{games: []PragmaticGame{
		{ID: "pp-gates-olympus", GameName: "Gates of Olympus", Product: "video_slot", Payout: 0.965, Variance: 3, ImagePath: "/pragmatic/gates-of-olympus.png", Status: "active"},
		{ID: "pp-sweet-bonanza", GameName: "Sweet Bonanza", Product: "video slots", Payout: 96.48, Variance: 2, ImagePath: "/pragmatic/sweet-bonanza.png", Status: "active"},
	}}
}

func (a PragmaticPlayAdapter) GetGames() ([]Game, error) {
	games := make([]Game, 0, len(a.games))
	for _, raw := range a.games {
		game, err := NormalizeGame(RawGame{
			Provider:     PragmaticPlayProvider,
			ExternalID:   raw.ID,
			Name:         raw.GameName,
			Category:     raw.Product,
			RTP:          raw.Payout,
			Volatility:   varianceToVolatility(raw.Variance),
			ThumbnailURL: raw.ImagePath,
			IsActive:     raw.Status == "active",
		})
		if err != nil {
			return nil, err
		}
		games = append(games, game)
	}
	return games, nil
}

func varianceToVolatility(variance int) string {
	switch variance {
	case 1:
		return "low"
	case 3:
		return "high"
	default:
		return "medium"
	}
}

// EvolutionGame mirrors a small slice of Evolution-style live casino API data.
type EvolutionGame struct {
	TableID     string
	DisplayName string
	StudioType  string
	ReturnRate  float64
	RiskProfile string
	PreviewURL  string
	Open        bool
}

// EvolutionAdapter adapts Evolution API responses to the common Provider interface.
type EvolutionAdapter struct {
	games []EvolutionGame
}

func NewMockEvolutionProvider() Provider {
	return EvolutionAdapter{games: []EvolutionGame{
		{TableID: "evo-lightning-roulette", DisplayName: "Lightning Roulette", StudioType: "live", ReturnRate: 97.3, RiskProfile: "medium", PreviewURL: "evolution/lightning-roulette.png", Open: true},
		{TableID: "evo-crazy-time", DisplayName: "Crazy Time", StudioType: "live casino", ReturnRate: 96.08, RiskProfile: "high", PreviewURL: "evolution/crazy-time.png", Open: true},
	}}
}

func (a EvolutionAdapter) GetGames() ([]Game, error) {
	games := make([]Game, 0, len(a.games))
	for _, raw := range a.games {
		game, err := NormalizeGame(RawGame{
			Provider:     EvolutionProvider,
			ExternalID:   raw.TableID,
			Name:         raw.DisplayName,
			Category:     raw.StudioType,
			RTP:          raw.ReturnRate,
			Volatility:   raw.RiskProfile,
			ThumbnailURL: raw.PreviewURL,
			IsActive:     raw.Open,
		})
		if err != nil {
			return nil, err
		}
		games = append(games, game)
	}
	return games, nil
}

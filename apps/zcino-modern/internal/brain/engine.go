package brain

import (
	"math"
	"strings"

	"game-catalog-service/internal/domain"
)

const (
	ActionNoop             = "noop"
	ActionBoostHighRTP     = "boost_high_rtp"
	ActionScaleUp          = "scale_up"
	ActionRollback         = "rollback"
	ActionAutoscaleTraffic = "autoscale_traffic"
	ActionKillSwitch       = "kill_switch"
)

type Metrics struct {
	CTR              float64
	Conversion       float64
	LatencyMillis    float64
	ErrorRate        float64
	RequestsPerSec   float64
	RevenuePerClick  float64
	SpendPerHour     float64
	BudgetPerHour    float64
	KillSwitchActive bool
}

type Decision struct {
	Action string
	Value  float64
	Reason string
	Risky  bool
}

type Guardrails struct {
	MinCTR                  float64
	MaxLatencyMillis        float64
	MaxErrorRate            float64
	TrafficSpikeRPS         float64
	MaxScaleFactor          float64
	MaxBoostMultiplier      float64
	AllowDirectRiskyActions bool
}

func DefaultGuardrails() Guardrails {
	return Guardrails{
		MinCTR:             0.02,
		MaxLatencyMillis:   500,
		MaxErrorRate:       0.05,
		TrafficSpikeRPS:    1000,
		MaxScaleFactor:     3,
		MaxBoostMultiplier: 1.2,
	}
}

type Engine struct {
	guardrails Guardrails
}

func NewEngine(guardrails Guardrails) Engine {
	return Engine{guardrails: normalizeGuardrails(guardrails)}
}

func (e Engine) Decide(m Metrics) Decision {
	g := e.guardrails
	if m.KillSwitchActive {
		return Decision{Action: ActionKillSwitch, Reason: "kill switch is active", Risky: true}
	}
	if budgetExceeded(m) {
		return Decision{Action: ActionNoop, Reason: "budget guardrail blocks optimization"}
	}
	if m.ErrorRate > g.MaxErrorRate {
		return Decision{Action: ActionRollback, Value: m.ErrorRate, Reason: "error rate exceeded rollback threshold", Risky: !g.AllowDirectRiskyActions}
	}
	if m.LatencyMillis > g.MaxLatencyMillis {
		scale := clamp(m.LatencyMillis/g.MaxLatencyMillis, 1, g.MaxScaleFactor)
		return Decision{Action: ActionScaleUp, Value: scale, Reason: "latency exceeded scale threshold", Risky: !g.AllowDirectRiskyActions}
	}
	if m.RequestsPerSec > g.TrafficSpikeRPS {
		scale := clamp(m.RequestsPerSec/g.TrafficSpikeRPS, 1, g.MaxScaleFactor)
		return Decision{Action: ActionAutoscaleTraffic, Value: scale, Reason: "traffic spike exceeded autoscale threshold", Risky: !g.AllowDirectRiskyActions}
	}
	if m.CTR > 0 && m.CTR < g.MinCTR {
		return Decision{Action: ActionBoostHighRTP, Value: g.MaxBoostMultiplier, Reason: "ctr is below ranking threshold"}
	}
	return Decision{Action: ActionNoop, Reason: "metrics are within guardrails"}
}

func Decide(m Metrics) Decision {
	return NewEngine(DefaultGuardrails()).Decide(m)
}

type GameMetrics struct {
	CTR             float64
	Conversion      float64
	AffiliatePayout float64
}

type ScoreWeights struct {
	CTR             float64
	Conversion      float64
	RTP             float64
	AffiliatePayout float64
}

func DefaultScoreWeights() ScoreWeights {
	return ScoreWeights{CTR: 0.35, Conversion: 0.35, RTP: 0.15, AffiliatePayout: 0.15}
}

func Score(game domain.Game, metrics GameMetrics, weights ScoreWeights) float64 {
	weights = normalizeScoreWeights(weights)
	return (clamp01(metrics.CTR) * weights.CTR) +
		(clamp01(metrics.Conversion) * weights.Conversion) +
		(clamp01(game.RTP/100) * weights.RTP) +
		(clamp01(metrics.AffiliatePayout) * weights.AffiliatePayout)
}

func SortKey(game domain.Game, metrics GameMetrics) float64 {
	return Score(game, metrics, DefaultScoreWeights())
}

func normalizeGuardrails(g Guardrails) Guardrails {
	defaults := DefaultGuardrails()
	if g.MinCTR <= 0 {
		g.MinCTR = defaults.MinCTR
	}
	if g.MaxLatencyMillis <= 0 {
		g.MaxLatencyMillis = defaults.MaxLatencyMillis
	}
	if g.MaxErrorRate <= 0 {
		g.MaxErrorRate = defaults.MaxErrorRate
	}
	if g.TrafficSpikeRPS <= 0 {
		g.TrafficSpikeRPS = defaults.TrafficSpikeRPS
	}
	if g.MaxScaleFactor <= 0 {
		g.MaxScaleFactor = defaults.MaxScaleFactor
	}
	if g.MaxBoostMultiplier <= 0 {
		g.MaxBoostMultiplier = defaults.MaxBoostMultiplier
	}
	return g
}

func normalizeScoreWeights(w ScoreWeights) ScoreWeights {
	if w == (ScoreWeights{}) {
		return DefaultScoreWeights()
	}
	total := w.CTR + w.Conversion + w.RTP + w.AffiliatePayout
	if total <= 0 || math.IsNaN(total) || math.IsInf(total, 0) {
		return DefaultScoreWeights()
	}
	return ScoreWeights{CTR: w.CTR / total, Conversion: w.Conversion / total, RTP: w.RTP / total, AffiliatePayout: w.AffiliatePayout / total}
}

func budgetExceeded(m Metrics) bool {
	return m.BudgetPerHour > 0 && m.SpendPerHour > m.BudgetPerHour
}

func clamp(value, minValue, maxValue float64) float64 {
	if value < minValue {
		return minValue
	}
	if value > maxValue {
		return maxValue
	}
	return value
}

func clamp01(value float64) float64 {
	if math.IsNaN(value) || math.IsInf(value, 0) {
		return 0
	}
	return clamp(value, 0, 1)
}

func IsRiskyAction(action string) bool {
	switch strings.TrimSpace(action) {
	case ActionScaleUp, ActionRollback, ActionAutoscaleTraffic, ActionKillSwitch:
		return true
	default:
		return false
	}
}

type PolicyInput struct {
	Metrics         Metrics    `json:"metrics"`
	Guardrails      Guardrails `json:"guardrails"`
	RequestedAction string     `json:"requested_action"`
	Country         string     `json:"country"`
	RealMoney       bool       `json:"real_money"`
	TenantID        string     `json:"tenant_id"`
}

type PolicyResult struct {
	Allow    bool     `json:"allow"`
	Deny     []string `json:"deny"`
	Decision Decision `json:"decision"`
}

func (e Engine) EvaluatePolicy(input PolicyInput) PolicyResult {
	input.Guardrails = normalizeGuardrails(input.Guardrails)
	if input.Guardrails == (Guardrails{}) {
		input.Guardrails = e.guardrails
	}
	decision := e.Decide(input.Metrics)
	denies := make([]string, 0)
	if input.RealMoney && strings.EqualFold(input.Country, "TH") {
		denies = append(denies, "real-money activity is blocked in Thailand")
	}
	if input.TenantID == "" {
		denies = append(denies, "tenant id is required")
	}
	if input.Metrics.KillSwitchActive {
		denies = append(denies, "kill switch is active")
	}
	if input.Metrics.ErrorRate > input.Guardrails.MaxErrorRate {
		denies = append(denies, "error rate exceeds guardrail")
	}
	if budgetExceeded(input.Metrics) {
		denies = append(denies, "spend exceeds budget")
	}
	if input.RequestedAction != "" && IsRiskyAction(input.RequestedAction) && !input.Guardrails.AllowDirectRiskyActions {
		denies = append(denies, "risky action requires human approval")
	}
	return PolicyResult{Allow: len(denies) == 0, Deny: denies, Decision: decision}
}

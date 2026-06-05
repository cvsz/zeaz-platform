package gateway

import (
	"context"
	"time"
)

type TokenRotationPolicy struct {
	MaxTokenTTL        time.Duration
	RotationLeadWindow time.Duration
	Now                func() time.Time
}

func (p TokenRotationPolicy) ShouldRotate(_ context.Context, c Claims) bool {
	now := time.Now().UTC()
	if p.Now != nil {
		now = p.Now().UTC()
	}
	lead := p.RotationLeadWindow
	if lead <= 0 {
		lead = 5 * time.Minute
	}
	if c.ExpiresAt.IsZero() {
		return true
	}
	if p.MaxTokenTTL > 0 && !c.IssuedAt.IsZero() && c.ExpiresAt.Sub(c.IssuedAt) > p.MaxTokenTTL {
		return true
	}
	return c.ExpiresAt.Sub(now) <= lead
}

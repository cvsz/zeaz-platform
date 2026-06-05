package gateway

import "strings"

type MerchantPolicy struct {
	allow map[string]struct{}
	deny  map[string]struct{}
}

func NewMerchantPolicy(allowList, denyList []string) *MerchantPolicy {
	p := &MerchantPolicy{
		allow: make(map[string]struct{}, len(allowList)),
		deny:  make(map[string]struct{}, len(denyList)),
	}
	for _, id := range allowList {
		id = normalizePolicyValue(id)
		if id != "" {
			p.allow[id] = struct{}{}
		}
	}
	for _, id := range denyList {
		id = normalizePolicyValue(id)
		if id != "" {
			p.deny[id] = struct{}{}
		}
	}
	return p
}

func (p *MerchantPolicy) Allowed(merchantID string) bool {
	id := normalizePolicyValue(merchantID)
	if id == "" {
		return false
	}
	if _, blocked := p.deny[id]; blocked {
		return false
	}
	if len(p.allow) == 0 {
		return true
	}
	_, ok := p.allow[id]
	return ok
}

func normalizePolicyValue(v string) string {
	return strings.ToUpper(strings.TrimSpace(v))
}

package gateway

type CountryPolicy struct {
	allowed map[string]struct{}
	blocked map[string]struct{}
}

func NewCountryPolicy(allowedCountries, blockedCountries []string) *CountryPolicy {
	p := &CountryPolicy{
		allowed: make(map[string]struct{}, len(allowedCountries)),
		blocked: make(map[string]struct{}, len(blockedCountries)),
	}
	for _, c := range allowedCountries {
		c = normalizePolicyValue(c)
		if c != "" {
			p.allowed[c] = struct{}{}
		}
	}
	for _, c := range blockedCountries {
		c = normalizePolicyValue(c)
		if c != "" {
			p.blocked[c] = struct{}{}
		}
	}
	return p
}

func (p *CountryPolicy) Allowed(countryCode string) bool {
	cc := normalizePolicyValue(countryCode)
	if cc == "" {
		return false
	}
	if _, blocked := p.blocked[cc]; blocked {
		return false
	}
	if len(p.allowed) == 0 {
		return true
	}
	_, ok := p.allowed[cc]
	return ok
}

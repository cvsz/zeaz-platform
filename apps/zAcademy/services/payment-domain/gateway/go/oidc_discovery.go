package gateway

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type OIDCConfiguration struct {
	Issuer  string `json:"issuer"`
	JWKSURI string `json:"jwks_uri"`
}

func DiscoverOIDCConfiguration(ctx context.Context, httpClient *http.Client, issuer string) (OIDCConfiguration, error) {
	if issuer == "" {
		return OIDCConfiguration{}, errors.New("issuer required")
	}
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 5 * time.Second}
	}
	wellKnown := strings.TrimRight(issuer, "/") + "/.well-known/openid-configuration"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, wellKnown, nil)
	if err != nil {
		return OIDCConfiguration{}, err
	}
	res, err := httpClient.Do(req)
	if err != nil {
		return OIDCConfiguration{}, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return OIDCConfiguration{}, fmt.Errorf("oidc discovery status: %d", res.StatusCode)
	}
	var cfg OIDCConfiguration
	if err := json.NewDecoder(res.Body).Decode(&cfg); err != nil {
		return OIDCConfiguration{}, err
	}
	if cfg.Issuer == "" || cfg.JWKSURI == "" {
		return OIDCConfiguration{}, errors.New("invalid oidc configuration")
	}
	if strings.TrimRight(cfg.Issuer, "/") != strings.TrimRight(issuer, "/") {
		return OIDCConfiguration{}, errors.New("issuer mismatch in discovery document")
	}
	return cfg, nil
}

package gateway

import (
	"context"
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

type Claims struct {
	Subject   string
	Scope     []string
	Roles     []string
	Issuer    string
	Audience  []string
	ExpiresAt time.Time
	IssuedAt  time.Time
	NotBefore time.Time
	JTI       string
}

type JWTValidator interface {
	Validate(ctx context.Context, token string) (Claims, error)
}

type JWKSProvider interface {
	PublicKey(ctx context.Context, kid string) (*rsa.PublicKey, error)
}

type Validator struct {
	JWKS      JWKSProvider
	Issuer    string
	Audience  string
	ClockSkew time.Duration
	Now       func() time.Time
}

func (v Validator) Validate(ctx context.Context, token string) (Claims, error) {
	if token == "" {
		return Claims{}, errors.New("empty token")
	}
	if v.JWKS == nil {
		return Claims{}, errors.New("jwks provider required")
	}
	if v.Issuer == "" || v.Audience == "" {
		return Claims{}, errors.New("issuer and audience required")
	}
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return Claims{}, errors.New("malformed jwt")
	}
	var header struct {
		Alg string `json:"alg"`
		Kid string `json:"kid"`
	}
	hdr, err := decodeJWTPart(parts[0])
	if err != nil {
		return Claims{}, err
	}
	if err := json.Unmarshal(hdr, &header); err != nil {
		return Claims{}, err
	}
	if header.Alg != "RS256" {
		return Claims{}, fmt.Errorf("unsupported alg: %s", header.Alg)
	}
	if header.Kid == "" {
		return Claims{}, errors.New("missing kid")
	}
	payloadBytes, err := decodeJWTPart(parts[1])
	if err != nil {
		return Claims{}, err
	}
	var payload struct {
		Sub   string          `json:"sub"`
		Scope any             `json:"scope"`
		Roles []string        `json:"roles"`
		Iss   string          `json:"iss"`
		Aud   json.RawMessage `json:"aud"`
		Exp   int64           `json:"exp"`
		Iat   int64           `json:"iat"`
		Nbf   int64           `json:"nbf"`
		JTI   string          `json:"jti"`
	}
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return Claims{}, err
	}
	pub, err := v.JWKS.PublicKey(ctx, header.Kid)
	if err != nil {
		return Claims{}, err
	}
	sig, err := decodeJWTPart(parts[2])
	if err != nil {
		return Claims{}, err
	}
	h := sha256.Sum256([]byte(parts[0] + "." + parts[1]))
	if err := rsa.VerifyPKCS1v15(pub, crypto.SHA256, h[:], sig); err != nil {
		return Claims{}, errors.New("invalid signature")
	}
	now := time.Now().UTC()
	if v.Now != nil {
		now = v.Now().UTC()
	}
	skew := v.ClockSkew
	if skew <= 0 {
		skew = time.Minute
	}
	if payload.Iss != v.Issuer {
		return Claims{}, errors.New("issuer mismatch")
	}
	aud, err := parseAudience(payload.Aud)
	if err != nil {
		return Claims{}, err
	}
	if !contains(aud, v.Audience) {
		return Claims{}, errors.New("audience mismatch")
	}
	if payload.Exp == 0 || now.After(time.Unix(payload.Exp, 0).UTC().Add(skew)) {
		return Claims{}, errors.New("token expired")
	}
	if payload.Nbf > 0 && now.Before(time.Unix(payload.Nbf, 0).UTC().Add(-skew)) {
		return Claims{}, errors.New("token not valid yet")
	}
	if payload.Iat > 0 && now.Before(time.Unix(payload.Iat, 0).UTC().Add(-skew)) {
		return Claims{}, errors.New("token issued in future")
	}
	return Claims{
		Subject:   payload.Sub,
		Scope:     parseScope(payload.Scope),
		Roles:     payload.Roles,
		Issuer:    payload.Iss,
		Audience:  aud,
		ExpiresAt: time.Unix(payload.Exp, 0).UTC(),
		IssuedAt:  time.Unix(payload.Iat, 0).UTC(),
		NotBefore: time.Unix(payload.Nbf, 0).UTC(),
		JTI:       payload.JTI,
	}, nil
}

func decodeJWTPart(part string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(part)
}

func parseScope(raw any) []string {
	switch v := raw.(type) {
	case string:
		return NormalizeScopes(strings.Fields(v))
	case []any:
		out := make([]string, 0, len(v))
		for _, i := range v {
			if s, ok := i.(string); ok {
				out = append(out, s)
			}
		}
		return NormalizeScopes(out)
	default:
		return nil
	}
}

func parseAudience(raw json.RawMessage) ([]string, error) {
	var single string
	if err := json.Unmarshal(raw, &single); err == nil {
		return []string{single}, nil
	}
	var list []string
	if err := json.Unmarshal(raw, &list); err == nil {
		return list, nil
	}
	return nil, errors.New("invalid aud")
}

func contains(values []string, target string) bool {
	for _, v := range values {
		if v == target {
			return true
		}
	}
	return false
}

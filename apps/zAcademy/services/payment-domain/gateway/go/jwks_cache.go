package gateway

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"sync"
	"time"
)

type JWKSCache struct {
	mu         sync.RWMutex
	httpClient *http.Client
	jwksURI    string
	ttl        time.Duration
	expiresAt  time.Time
	keys       map[string]*rsa.PublicKey
}

func NewJWKSCache(httpClient *http.Client, jwksURI string, ttl time.Duration) (*JWKSCache, error) {
	if jwksURI == "" {
		return nil, errors.New("jwks uri required")
	}
	if ttl <= 0 {
		ttl = 10 * time.Minute
	}
	if httpClient == nil {
		httpClient = &http.Client{Timeout: 5 * time.Second}
	}
	return &JWKSCache{httpClient: httpClient, jwksURI: jwksURI, ttl: ttl, keys: map[string]*rsa.PublicKey{}}, nil
}

func NewJWKSCacheFromIssuer(ctx context.Context, httpClient *http.Client, issuer string, ttl time.Duration) (*JWKSCache, error) {
	cfg, err := DiscoverOIDCConfiguration(ctx, httpClient, issuer)
	if err != nil {
		return nil, err
	}
	return NewJWKSCache(httpClient, cfg.JWKSURI, ttl)
}

func (j *JWKSCache) PublicKey(ctx context.Context, kid string) (*rsa.PublicKey, error) {
	if kid == "" {
		return nil, errors.New("kid required")
	}
	if err := j.ensureFresh(ctx); err != nil {
		return nil, err
	}
	j.mu.RLock()
	defer j.mu.RUnlock()
	pk, ok := j.keys[kid]
	if !ok {
		return nil, errors.New("kid not found")
	}
	return pk, nil
}

func (j *JWKSCache) ensureFresh(ctx context.Context) error {
	j.mu.RLock()
	fresh := time.Now().UTC().Before(j.expiresAt) && len(j.keys) > 0
	j.mu.RUnlock()
	if fresh {
		return nil
	}
	j.mu.Lock()
	defer j.mu.Unlock()
	if time.Now().UTC().Before(j.expiresAt) && len(j.keys) > 0 {
		return nil
	}
	keys, err := fetchJWKS(ctx, j.httpClient, j.jwksURI)
	if err != nil {
		return err
	}
	j.keys = keys
	j.expiresAt = time.Now().UTC().Add(j.ttl)
	return nil
}

func fetchJWKS(ctx context.Context, client *http.Client, uri string) (map[string]*rsa.PublicKey, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, uri, nil)
	if err != nil {
		return nil, err
	}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("jwks status: %d", res.StatusCode)
	}
	var body struct {
		Keys []struct {
			Kty string `json:"kty"`
			Kid string `json:"kid"`
			Use string `json:"use"`
			Alg string `json:"alg"`
			N   string `json:"n"`
			E   string `json:"e"`
		} `json:"keys"`
	}
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		return nil, err
	}
	out := make(map[string]*rsa.PublicKey, len(body.Keys))
	for _, key := range body.Keys {
		if key.Kty != "RSA" || key.Kid == "" || key.N == "" || key.E == "" {
			continue
		}
		pk, err := jwkToRSAPublicKey(key.N, key.E)
		if err != nil {
			continue
		}
		out[key.Kid] = pk
	}
	if len(out) == 0 {
		return nil, errors.New("no usable rsa keys in jwks")
	}
	return out, nil
}

func jwkToRSAPublicKey(n, e string) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(n)
	if err != nil {
		return nil, err
	}
	eBytes, err := base64.RawURLEncoding.DecodeString(e)
	if err != nil {
		return nil, err
	}
	modulus := new(big.Int).SetBytes(nBytes)
	exponent := new(big.Int).SetBytes(eBytes).Int64()
	if exponent <= 0 {
		return nil, errors.New("invalid rsa exponent")
	}
	return &rsa.PublicKey{N: modulus, E: int(exponent)}, nil
}

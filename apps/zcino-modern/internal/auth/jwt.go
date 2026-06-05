package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const claimsContextKey contextKey = "auth_claims"

var ErrUnauthorized = errors.New("unauthorized")

type Claims struct {
	UserID   string   `json:"user_id"`
	TenantID string   `json:"tenant_id,omitempty"`
	Roles    []string `json:"roles"`
	jwt.RegisteredClaims
}

type TokenManager struct {
	secret []byte
	issuer string
	ttl    time.Duration
	now    func() time.Time
}

func NewTokenManager(secret, issuer string, ttl time.Duration) *TokenManager {
	return &TokenManager{secret: []byte(secret), issuer: issuer, ttl: ttl, now: time.Now}
}

func (m *TokenManager) Generate(userID string, roles []string) (string, error) {
	return m.GenerateForTenant(userID, "", roles)
}

func (m *TokenManager) GenerateForTenant(userID, tenantID string, roles []string) (string, error) {
	issuedAt := m.now().UTC()
	claims := Claims{
		UserID:   userID,
		TenantID: tenantID,
		Roles:    roles,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    m.issuer,
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(issuedAt),
			ExpiresAt: jwt.NewNumericDate(issuedAt.Add(m.ttl)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.secret)
}

func (m *TokenManager) Validate(tokenValue string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenValue, claims, func(token *jwt.Token) (any, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, fmt.Errorf("unexpected signing method %s", token.Header["alg"])
		}
		return m.secret, nil
	}, jwt.WithIssuer(m.issuer), jwt.WithExpirationRequired(), jwt.WithLeeway(30*time.Second))
	if err != nil || !token.Valid {
		return nil, ErrUnauthorized
	}
	if claims.UserID == "" || claims.Subject != claims.UserID {
		return nil, ErrUnauthorized
	}
	return claims, nil
}

func WithClaims(ctx context.Context, claims *Claims) context.Context {
	return context.WithValue(ctx, claimsContextKey, claims)
}

func ClaimsFromContext(ctx context.Context) (*Claims, bool) {
	claims, ok := ctx.Value(claimsContextKey).(*Claims)
	return claims, ok
}

func HasRole(claims *Claims, role string) bool {
	if claims == nil {
		return false
	}
	for _, claimRole := range claims.Roles {
		if claimRole == role {
			return true
		}
	}
	return false
}

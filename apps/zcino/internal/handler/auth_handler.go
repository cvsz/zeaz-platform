package handler

import (
	"crypto/subtle"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"game-catalog-service/internal/auth"
	"game-catalog-service/internal/middleware"
)

type AuthHandler struct {
	tokens        *auth.TokenManager
	demoAdminUser string
	demoAdminPass string
}

type LoginRequest struct {
	UserID   string `json:"user_id"`
	Password string `json:"password"`
}

type TokenResponse struct {
	AccessToken string   `json:"access_token"`
	TokenType   string   `json:"token_type"`
	Roles       []string `json:"roles"`
	TenantID    string   `json:"tenant_id,omitempty"`
}

func NewAuthHandler(tokens *auth.TokenManager, demoAdminUser, demoAdminPass string) *AuthHandler {
	return &AuthHandler{tokens: tokens, demoAdminUser: demoAdminUser, demoAdminPass: demoAdminPass}
}

func (h *AuthHandler) Token(w http.ResponseWriter, r *http.Request) {
	request, err := decodeLoginRequest(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad_request", err.Error())
		return
	}
	if subtle.ConstantTimeCompare([]byte(request.UserID), []byte(h.demoAdminUser)) != 1 || subtle.ConstantTimeCompare([]byte(request.Password), []byte(h.demoAdminPass)) != 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "invalid credentials")
		return
	}

	roles := []string{"admin"}
	tenantID := tokenTenantID(r)
	token, err := h.tokens.GenerateForTenant(request.UserID, tenantID, roles)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_server_error", "could not create token")
		return
	}
	writeJSON(w, http.StatusOK, TokenResponse{AccessToken: token, TokenType: "Bearer", Roles: roles, TenantID: tenantID})
}

func tokenTenantID(r *http.Request) string {
	tenantID := strings.TrimSpace(middleware.TenantID(r.Context()))
	if tenantID == "" || tenantID == middleware.DefaultTenantID {
		return ""
	}
	return tenantID
}

func decodeLoginRequest(r *http.Request) (LoginRequest, error) {
	defer r.Body.Close()
	decoder := json.NewDecoder(io.LimitReader(r.Body, 1<<20))
	decoder.DisallowUnknownFields()
	var request LoginRequest
	if err := decoder.Decode(&request); err != nil {
		return LoginRequest{}, err
	}
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		return LoginRequest{}, errors.New("request body must contain a single JSON object")
	}
	if request.UserID == "" || request.Password == "" {
		return LoginRequest{}, errors.New("user_id and password are required")
	}
	return request, nil
}

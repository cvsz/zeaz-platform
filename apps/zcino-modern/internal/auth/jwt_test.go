package auth

import (
	"testing"
	"time"
)

func TestTokenManagerGenerateValidate(t *testing.T) {
	manager := NewTokenManager("test-secret", "test-issuer", time.Hour)
	token, err := manager.Generate("user-123", []string{"admin"})
	if err != nil {
		t.Fatalf("generate token: %v", err)
	}

	claims, err := manager.Validate(token)
	if err != nil {
		t.Fatalf("validate token: %v", err)
	}
	if claims.UserID != "user-123" {
		t.Fatalf("expected user id user-123, got %q", claims.UserID)
	}
	if !HasRole(claims, "admin") {
		t.Fatal("expected admin role")
	}
}

func TestTokenManagerRejectsWrongSecret(t *testing.T) {
	issuer := "test-issuer"
	token, err := NewTokenManager("test-secret", issuer, time.Hour).Generate("user-123", []string{"admin"})
	if err != nil {
		t.Fatalf("generate token: %v", err)
	}
	if _, err := NewTokenManager("other-secret", issuer, time.Hour).Validate(token); err == nil {
		t.Fatal("expected validation to fail with the wrong secret")
	}
}

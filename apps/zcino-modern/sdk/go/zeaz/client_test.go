package zeaz

import (
	"bytes"
	"crypto/ed25519"
	"encoding/base64"
	"testing"

	"game-catalog-service/internal/zeaz/protocol"
)

func TestSignerSignsVerifiableEnvelope(t *testing.T) {
	seed := bytes.Repeat([]byte{7}, ed25519.SeedSize)
	signer, publicKey, err := NewSigner("org-a", seed)
	if err != nil {
		t.Fatal(err)
	}
	env, err := signer.Sign(protocol.KindTask, protocol.Task{ID: "t1", RequesterOrgID: "org-a", Type: "demo", Budget: 1, MaxRisk: 0.5}, "task:t1")
	if err != nil {
		t.Fatal(err)
	}
	resolver := protocol.KeyResolverFunc(func(keyID string) (ed25519.PublicKey, bool) {
		if keyID != "org-a" {
			return nil, false
		}
		decoded, err := base64.RawURLEncoding.DecodeString(publicKey)
		return decoded, err == nil
	})
	if err := protocol.Verify(env, resolver, env.IssuedAt.Add(1)); err != nil {
		t.Fatal(err)
	}
}

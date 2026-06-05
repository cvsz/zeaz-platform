package ecosystem

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/json"
	"fmt"
)

type KeyPair struct {
	PublicKey  ed25519.PublicKey
	PrivateKey ed25519.PrivateKey
}

type TrustRegistry struct {
	orgs map[string]Org
}

func GenerateIdentity() (KeyPair, error) {
	pub, priv, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return KeyPair{}, err
	}
	return KeyPair{PublicKey: pub, PrivateKey: priv}, nil
}

func Sign(msg []byte, privKey ed25519.PrivateKey) []byte {
	return ed25519.Sign(privKey, msg)
}

func Verify(msg []byte, signature []byte, pubKey ed25519.PublicKey) bool {
	return ed25519.Verify(pubKey, msg, signature)
}

func CanonicalBytes(v any) ([]byte, error) {
	return json.Marshal(v)
}

func NewTrustRegistry(orgs ...Org) (*TrustRegistry, error) {
	registry := &TrustRegistry{orgs: make(map[string]Org, len(orgs))}
	for _, org := range orgs {
		if err := registry.Register(org); err != nil {
			return nil, err
		}
	}
	return registry, nil
}

func (r *TrustRegistry) Register(org Org) error {
	if r.orgs == nil {
		r.orgs = make(map[string]Org)
	}
	if err := org.Validate(); err != nil {
		return err
	}
	r.orgs[org.ID] = org
	return nil
}

func (r *TrustRegistry) Org(id string) (Org, bool) {
	if r == nil {
		return Org{}, false
	}
	org, ok := r.orgs[id]
	return org, ok
}

func (r *TrustRegistry) VerifySignedPayload(orgID string, payload any, signature []byte) error {
	org, ok := r.Org(orgID)
	if !ok {
		return fmt.Errorf("unknown org %q", orgID)
	}
	if !org.Active {
		return fmt.Errorf("org %q is inactive", orgID)
	}
	msg, err := CanonicalBytes(payload)
	if err != nil {
		return err
	}
	if !Verify(msg, signature, ed25519.PublicKey(org.PublicKey)) {
		return fmt.Errorf("invalid signature for org %q", orgID)
	}
	return nil
}

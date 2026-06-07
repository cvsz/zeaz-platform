package interop

import "crypto/ed25519"

// Identity represents a federated ecosystem authority that can sign interop
// requests. PublicKey is stored as raw ed25519 public key bytes so callers can
// encode it as DID documents, JWKS, or another registry format at the edge.
type Identity struct {
	OrgID     string
	PublicKey []byte
	Domain    string
}

// VerifySignature verifies that sig was produced by the holder of pubKey for
// msg. Invalid key sizes, empty signatures, or tampered messages return false.
func VerifySignature(msg []byte, sig []byte, pubKey []byte) bool {
	if len(pubKey) != ed25519.PublicKeySize || len(sig) != ed25519.SignatureSize {
		return false
	}
	return ed25519.Verify(ed25519.PublicKey(pubKey), msg, sig)
}

package protocol

import (
	"bytes"
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"
)

const (
	CurrentMajor uint32 = 1
	CurrentMinor uint32 = 0
	CurrentPatch uint32 = 0

	KindTask               = "zeaz.task.v1"
	KindBid                = "zeaz.bid.v1"
	KindCompletion         = "zeaz.completion.v1"
	KindResult             = "zeaz.result.v1"
	KindPeer               = "zeaz.peer.v1"
	KindGovernanceProposal = "zeaz.governance.proposal.v1"
	KindGovernanceVote     = "zeaz.governance.vote.v1"
)

type Version struct {
	Major uint32 `json:"major"`
	Minor uint32 `json:"minor"`
	Patch uint32 `json:"patch"`
}

func CurrentVersion() Version {
	return Version{Major: CurrentMajor, Minor: CurrentMinor, Patch: CurrentPatch}
}

func (v Version) String() string { return fmt.Sprintf("%d.%d.%d", v.Major, v.Minor, v.Patch) }

func (v Version) CompatibleWith(current Version) bool {
	return v.Major == current.Major && v.Minor <= current.Minor
}

func NegotiateVersion(requested Version, supportedFeatures []string) NegotiationResult {
	current := CurrentVersion()
	if !requested.CompatibleWith(current) {
		return NegotiationResult{Accepted: false, Version: current, Reason: fmt.Sprintf("requested version %s is incompatible with node version %s", requested.String(), current.String())}
	}
	version := requested
	if version.Patch > current.Patch {
		version.Patch = current.Patch
	}
	return NegotiationResult{Accepted: true, Version: version, Features: append([]string(nil), supportedFeatures...)}
}

type NegotiationResult struct {
	Accepted bool     `json:"accepted"`
	Version  Version  `json:"version"`
	Reason   string   `json:"reason,omitempty"`
	Features []string `json:"features,omitempty"`
}

type Envelope struct {
	ID        string          `json:"id"`
	Kind      string          `json:"kind"`
	Version   Version         `json:"version"`
	Issuer    string          `json:"issuer"`
	IssuedAt  time.Time       `json:"issued_at"`
	ExpiresAt *time.Time      `json:"expires_at,omitempty"`
	Nonce     string          `json:"nonce"`
	Payload   json.RawMessage `json:"payload"`
	Signature Signature       `json:"signature"`
}

type Signature struct {
	Algorithm string `json:"algorithm"`
	KeyID     string `json:"key_id"`
	Value     string `json:"value"`
}

type Task struct {
	ID             string            `json:"id"`
	RequesterOrgID string            `json:"requester_org_id"`
	Type           string            `json:"type"`
	Budget         float64           `json:"budget"`
	MaxRisk        float64           `json:"max_risk"`
	Metadata       map[string]string `json:"metadata,omitempty"`
}

type Bid struct {
	ID          string            `json:"id"`
	TaskID      string            `json:"task_id"`
	BidderOrgID string            `json:"bidder_org_id"`
	Cost        float64           `json:"cost"`
	Score       float64           `json:"score"`
	Risk        float64           `json:"risk"`
	Metadata    map[string]string `json:"metadata,omitempty"`
}

type Completion struct {
	TaskID       string  `json:"task_id"`
	BidderOrgID  string  `json:"bidder_org_id"`
	Success      bool    `json:"success"`
	QualityScore float64 `json:"quality_score"`
	ResultRef    string  `json:"result_ref"`
}

type Result struct {
	TaskID        string  `json:"task_id"`
	VerifierOrgID string  `json:"verifier_org_id"`
	Score         float64 `json:"score"`
	Valid         bool    `json:"valid"`
}

type EconomicRule struct {
	UnitOfAccount string  `json:"unit_of_account"`
	MinStake      float64 `json:"min_stake"`
	FeeRate       float64 `json:"fee_rate"`
	Settlement    string  `json:"settlement"`
}

type GovernanceProposal struct {
	ID            string   `json:"id"`
	Title         string   `json:"title"`
	Kind          string   `json:"kind"`
	TargetVersion Version  `json:"target_version"`
	Changes       []string `json:"changes"`
}

type GovernanceVote struct {
	ProposalID string  `json:"proposal_id"`
	NodeID     string  `json:"node_id"`
	Weight     float64 `json:"weight"`
	Approve    bool    `json:"approve"`
}

type Peer struct {
	NodeID    string    `json:"node_id"`
	OrgID     string    `json:"org_id"`
	Address   string    `json:"address"`
	PublicKey string    `json:"public_key"`
	SeenAt    time.Time `json:"seen_at"`
}

type KeyResolver interface {
	ResolvePublicKey(keyID string) (ed25519.PublicKey, bool)
}

type KeyResolverFunc func(keyID string) (ed25519.PublicKey, bool)

func (f KeyResolverFunc) ResolvePublicKey(keyID string) (ed25519.PublicKey, bool) { return f(keyID) }

func NewEnvelope(kind, issuer, nonce string, payload any) (Envelope, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return Envelope{}, err
	}
	hash := sha256.Sum256(append([]byte(kind+":"+issuer+":"+nonce+":"), body...))
	return Envelope{ID: base64.RawURLEncoding.EncodeToString(hash[:16]), Kind: kind, Version: CurrentVersion(), Issuer: issuer, IssuedAt: time.Now().UTC(), Nonce: nonce, Payload: body}, nil
}

func Sign(env Envelope, keyID string, privateKey ed25519.PrivateKey) (Envelope, error) {
	if len(privateKey) != ed25519.PrivateKeySize {
		return Envelope{}, fmt.Errorf("ed25519 private key must be %d bytes", ed25519.PrivateKeySize)
	}
	env.Signature = Signature{Algorithm: "ed25519", KeyID: keyID}
	body, err := SigningBytes(env)
	if err != nil {
		return Envelope{}, err
	}
	env.Signature.Value = base64.RawURLEncoding.EncodeToString(ed25519.Sign(privateKey, body))
	return env, nil
}

func Verify(env Envelope, resolver KeyResolver, now time.Time) error {
	if !env.Version.CompatibleWith(CurrentVersion()) {
		return fmt.Errorf("incompatible protocol version %s", env.Version.String())
	}
	if env.Signature.Algorithm != "ed25519" {
		return fmt.Errorf("unsupported signature algorithm %q", env.Signature.Algorithm)
	}
	if env.ExpiresAt != nil && now.After(*env.ExpiresAt) {
		return fmt.Errorf("envelope expired at %s", env.ExpiresAt.Format(time.RFC3339))
	}
	publicKey, ok := resolver.ResolvePublicKey(env.Signature.KeyID)
	if !ok {
		return fmt.Errorf("unknown key id %q", env.Signature.KeyID)
	}
	sig, err := base64.RawURLEncoding.DecodeString(env.Signature.Value)
	if err != nil {
		return fmt.Errorf("decode signature: %w", err)
	}
	body, err := SigningBytes(env)
	if err != nil {
		return err
	}
	if !ed25519.Verify(publicKey, body, sig) {
		return fmt.Errorf("invalid signature")
	}
	return nil
}

func SigningBytes(env Envelope) ([]byte, error) {
	unsigned := env
	unsigned.Signature.Value = ""
	return CanonicalJSON(unsigned)
}

func CanonicalJSON(value any) ([]byte, error) {
	raw, err := json.Marshal(value)
	if err != nil {
		return nil, err
	}
	var decoded any
	if err := json.Unmarshal(raw, &decoded); err != nil {
		return nil, err
	}
	var buf bytes.Buffer
	writeCanonical(&buf, decoded)
	return buf.Bytes(), nil
}

func writeCanonical(buf *bytes.Buffer, value any) {
	switch typed := value.(type) {
	case nil:
		buf.WriteString("null")
	case bool:
		if typed {
			buf.WriteString("true")
		} else {
			buf.WriteString("false")
		}
	case float64:
		buf.WriteString(strconv.FormatFloat(typed, 'f', -1, 64))
	case string:
		encoded, _ := json.Marshal(typed)
		buf.Write(encoded)
	case []any:
		buf.WriteByte('[')
		for i, item := range typed {
			if i > 0 {
				buf.WriteByte(',')
			}
			writeCanonical(buf, item)
		}
		buf.WriteByte(']')
	case map[string]any:
		keys := make([]string, 0, len(typed))
		for key := range typed {
			keys = append(keys, key)
		}
		sort.Strings(keys)
		buf.WriteByte('{')
		for i, key := range keys {
			if i > 0 {
				buf.WriteByte(',')
			}
			encoded, _ := json.Marshal(key)
			buf.Write(encoded)
			buf.WriteByte(':')
			writeCanonical(buf, typed[key])
		}
		buf.WriteByte('}')
	default:
		buf.WriteString(strings.TrimSpace(fmt.Sprint(typed)))
	}
}

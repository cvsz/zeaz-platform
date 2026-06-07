package zeaz

import (
	"bytes"
	"context"
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"game-catalog-service/internal/zeaz/ledger"
	"game-catalog-service/internal/zeaz/protocol"
)

type Client struct {
	BaseURL    string
	HTTPClient *http.Client
}

func NewClient(baseURL string) *Client {
	return &Client{BaseURL: strings.TrimRight(baseURL, "/"), HTTPClient: http.DefaultClient}
}

func (c *Client) Version(ctx context.Context) (protocol.NegotiationResult, error) {
	var version protocol.Version
	if err := c.do(ctx, http.MethodGet, "/version", nil, &version); err != nil {
		return protocol.NegotiationResult{}, err
	}
	return protocol.NegotiationResult{Accepted: true, Version: version}, nil
}

func (c *Client) Negotiate(ctx context.Context, requested protocol.Version, features []string) (protocol.NegotiationResult, error) {
	body := protocol.NegotiationResult{Version: requested, Features: features}
	var out protocol.NegotiationResult
	return out, c.do(ctx, http.MethodPost, "/version/negotiate", body, &out)
}

func (c *Client) SubmitEnvelope(ctx context.Context, env protocol.Envelope) (ledger.Record, error) {
	var record ledger.Record
	return record, c.do(ctx, http.MethodPost, "/envelopes", env, &record)
}

func (c *Client) Ledger(ctx context.Context) (ledger.Snapshot, error) {
	var snapshot ledger.Snapshot
	return snapshot, c.do(ctx, http.MethodGet, "/ledger", nil, &snapshot)
}

func (c *Client) Peers(ctx context.Context) ([]protocol.Peer, error) {
	var peers []protocol.Peer
	return peers, c.do(ctx, http.MethodGet, "/peers", nil, &peers)
}

func (c *Client) AnnouncePeer(ctx context.Context, peer protocol.Peer) ([]protocol.Peer, error) {
	var peers []protocol.Peer
	return peers, c.do(ctx, http.MethodPost, "/peers", peer, &peers)
}

func (c *Client) SubmitTask(ctx context.Context, signer Signer, task protocol.Task) (ledger.Record, error) {
	env, err := signer.Sign(protocol.KindTask, task, "task:"+task.ID)
	if err != nil {
		return ledger.Record{}, err
	}
	return c.SubmitEnvelope(ctx, env)
}

func (c *Client) SubmitBid(ctx context.Context, signer Signer, bid protocol.Bid) (ledger.Record, error) {
	env, err := signer.Sign(protocol.KindBid, bid, "bid:"+bid.ID)
	if err != nil {
		return ledger.Record{}, err
	}
	return c.SubmitEnvelope(ctx, env)
}

func (c *Client) do(ctx context.Context, method, path string, in any, out any) error {
	var body bytes.Buffer
	if in != nil {
		if err := json.NewEncoder(&body).Encode(in); err != nil {
			return err
		}
	}
	req, err := http.NewRequestWithContext(ctx, method, c.BaseURL+path, &body)
	if err != nil {
		return err
	}
	if in != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	client := c.HTTPClient
	if client == nil {
		client = http.DefaultClient
	}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("zeaz node returned %s", resp.Status)
	}
	if out == nil {
		return nil
	}
	return json.NewDecoder(resp.Body).Decode(out)
}

type Signer struct {
	OrgID      string
	PrivateKey ed25519.PrivateKey
}

func NewSigner(orgID string, seed []byte) (Signer, string, error) {
	if len(seed) != ed25519.SeedSize {
		return Signer{}, "", fmt.Errorf("seed must be %d bytes", ed25519.SeedSize)
	}
	privateKey := ed25519.NewKeyFromSeed(seed)
	publicKey := privateKey.Public().(ed25519.PublicKey)
	return Signer{OrgID: orgID, PrivateKey: privateKey}, base64.RawURLEncoding.EncodeToString(publicKey), nil
}

func (s Signer) Sign(kind string, payload any, nonce string) (protocol.Envelope, error) {
	env, err := protocol.NewEnvelope(kind, s.OrgID, nonce, payload)
	if err != nil {
		return protocol.Envelope{}, err
	}
	env.IssuedAt = time.Now().UTC()
	return protocol.Sign(env, s.OrgID, s.PrivateKey)
}

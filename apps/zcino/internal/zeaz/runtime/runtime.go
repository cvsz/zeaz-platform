package runtime

import (
	"context"
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"time"

	"game-catalog-service/internal/zeaz/ledger"
	"game-catalog-service/internal/zeaz/protocol"
)

type Wallet struct {
	OrgID      string
	PublicKey  ed25519.PublicKey
	PrivateKey ed25519.PrivateKey
}

func NewWallet(orgID string) (*Wallet, error) {
	seed := sha256.Sum256([]byte(orgID))
	privateKey := ed25519.NewKeyFromSeed(seed[:])
	publicKey := privateKey.Public().(ed25519.PublicKey)
	return &Wallet{
		OrgID:      orgID,
		PublicKey:  publicKey,
		PrivateKey: privateKey,
	}, nil
}

func (w *Wallet) PublicKeyString() string {
	return base64.RawURLEncoding.EncodeToString(w.PublicKey)
}

func (w *Wallet) Sign(kind string, payload any, nonce string) (protocol.Envelope, error) {
	env, err := protocol.NewEnvelope(kind, w.OrgID, nonce, payload)
	if err != nil {
		return protocol.Envelope{}, err
	}
	return protocol.Sign(env, w.OrgID, w.PrivateKey)
}

type Agent struct {
	Name    string
	Role    string
	wallet  *Wallet
	service *ledger.Service
}

func NewAgent(name, role string, wallet *Wallet, service *ledger.Service) *Agent {
	return &Agent{
		Name:    name,
		Role:    role,
		wallet:  wallet,
		service: service,
	}
}

func (a *Agent) SubmitTask(ctx context.Context, task protocol.Task) (ledger.Record, error) {
	task.RequesterOrgID = a.wallet.OrgID
	env, err := a.wallet.Sign(protocol.KindTask, task, fmt.Sprintf("task-%d", time.Now().UnixNano()))
	if err != nil {
		return ledger.Record{}, err
	}
	return a.service.SubmitEnvelope(ctx, env)
}

func (a *Agent) SubmitBid(ctx context.Context, bid protocol.Bid) (ledger.Record, error) {
	bid.BidderOrgID = a.wallet.OrgID
	env, err := a.wallet.Sign(protocol.KindBid, bid, fmt.Sprintf("bid-%d", time.Now().UnixNano()))
	if err != nil {
		return ledger.Record{}, err
	}
	return a.service.SubmitEnvelope(ctx, env)
}

func (a *Agent) CompleteTask(ctx context.Context, comp protocol.Completion) (ledger.Record, error) {
	comp.BidderOrgID = a.wallet.OrgID
	env, err := a.wallet.Sign(protocol.KindCompletion, comp, fmt.Sprintf("comp-%d", time.Now().UnixNano()))
	if err != nil {
		return ledger.Record{}, err
	}
	return a.service.SubmitEnvelope(ctx, env)
}

func (a *Agent) SubmitResult(ctx context.Context, result protocol.Result) (ledger.Record, error) {
	result.VerifierOrgID = a.wallet.OrgID
	env, err := a.wallet.Sign(protocol.KindResult, result, fmt.Sprintf("result-%d", time.Now().UnixNano()))
	if err != nil {
		return ledger.Record{}, err
	}
	return a.service.SubmitEnvelope(ctx, env)
}

type Verifier struct {
	wallet *Wallet
}

func NewVerifier(wallet *Wallet) *Verifier {
	return &Verifier{wallet: wallet}
}

func (v *Verifier) Verify(env protocol.Envelope) error {
	return nil
}

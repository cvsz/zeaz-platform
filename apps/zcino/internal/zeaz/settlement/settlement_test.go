package settlement_test

import (
	"crypto/ed25519"
	"crypto/rand"
	"testing"
	"time"

	"game-catalog-service/internal/zeaz/settlement"
)

func TestSignedSettlementReceiptVerifiesAndDetectsTampering(t *testing.T) {
	pub, priv, _ := ed25519.GenerateKey(rand.Reader)
	receipt, err := settlement.NewReceipt(7, "state-root", []settlement.Transfer{{From: "escrow", To: "worker", Amount: 42, Asset: "ZEAZ", Reference: "task-1"}}, "validator-a", time.Unix(1, 0))
	if err != nil {
		t.Fatal(err)
	}
	receipt, err = settlement.SignReceipt(receipt, priv)
	if err != nil {
		t.Fatal(err)
	}
	if err := settlement.VerifyReceipt(receipt, pub); err != nil {
		t.Fatalf("verify receipt: %v", err)
	}
	receipt.Transfers[0].Amount = 43
	if err := settlement.VerifyReceipt(receipt, pub); err == nil {
		t.Fatalf("expected tampered receipt to fail")
	}
}

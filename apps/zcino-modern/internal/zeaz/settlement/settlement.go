package settlement

import (
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sort"
	"time"
)

type Transfer struct {
	From      string            `json:"from"`
	To        string            `json:"to"`
	Amount    uint64            `json:"amount"`
	Asset     string            `json:"asset"`
	Reference string            `json:"reference"`
	Metadata  map[string]string `json:"metadata,omitempty"`
}

type Receipt struct {
	ID             string     `json:"id"`
	Height         uint64     `json:"height"`
	StateRoot      string     `json:"state_root"`
	TransferRoot   string     `json:"transfer_root"`
	Transfers      []Transfer `json:"transfers"`
	SettlementHash string     `json:"settlement_hash"`
	SignerID       string     `json:"signer_id"`
	Signature      []byte     `json:"signature,omitempty"`
	SettledAt      time.Time  `json:"settled_at"`
}

func NewReceipt(height uint64, stateRoot string, transfers []Transfer, signerID string, settledAt time.Time) (Receipt, error) {
	if height == 0 || stateRoot == "" || signerID == "" {
		return Receipt{}, fmt.Errorf("height, state root, and signer id are required")
	}
	copied := append([]Transfer(nil), transfers...)
	root, err := TransferRoot(copied)
	if err != nil {
		return Receipt{}, err
	}
	receipt := Receipt{Height: height, StateRoot: stateRoot, TransferRoot: root, Transfers: copied, SignerID: signerID, SettledAt: settledAt.UTC()}
	receipt.SettlementHash = HashReceipt(receipt)
	receipt.ID = receipt.SettlementHash[:16]
	return receipt, nil
}

func SignReceipt(receipt Receipt, privateKey ed25519.PrivateKey) (Receipt, error) {
	if len(privateKey) != ed25519.PrivateKeySize {
		return Receipt{}, fmt.Errorf("ed25519 private key must be %d bytes", ed25519.PrivateKeySize)
	}
	receipt.Signature = ed25519.Sign(privateKey, ReceiptSignBytes(receipt))
	return receipt, nil
}

func VerifyReceipt(receipt Receipt, publicKey ed25519.PublicKey) error {
	if len(publicKey) != ed25519.PublicKeySize {
		return fmt.Errorf("ed25519 public key must be %d bytes", ed25519.PublicKeySize)
	}
	if receipt.SettlementHash != HashReceipt(receipt) {
		return fmt.Errorf("settlement hash mismatch")
	}
	root, err := TransferRoot(receipt.Transfers)
	if err != nil {
		return err
	}
	if root != receipt.TransferRoot {
		return fmt.Errorf("transfer merkle root mismatch")
	}
	if !ed25519.Verify(publicKey, ReceiptSignBytes(receipt), receipt.Signature) {
		return fmt.Errorf("invalid settlement receipt signature")
	}
	return nil
}

func HashReceipt(receipt Receipt) string {
	unsigned := receipt
	unsigned.Signature = nil
	unsigned.SettlementHash = ""
	unsigned.ID = ""
	body, _ := json.Marshal(unsigned)
	sum := sha256.Sum256(body)
	return hex.EncodeToString(sum[:])
}

func ReceiptSignBytes(receipt Receipt) []byte {
	return []byte("zeaz-settlement-v1:" + HashReceipt(receipt))
}

func TransferRoot(transfers []Transfer) (string, error) {
	if len(transfers) == 0 {
		sum := sha256.Sum256(nil)
		return hex.EncodeToString(sum[:]), nil
	}
	leaves := make([]string, len(transfers))
	for i, transfer := range transfers {
		if transfer.From == "" || transfer.To == "" || transfer.Amount == 0 || transfer.Asset == "" {
			return "", fmt.Errorf("transfer %d is missing from, to, amount, or asset", i)
		}
		leaves[i] = hashTransfer(transfer)
	}
	sort.Strings(leaves)
	for len(leaves) > 1 {
		next := make([]string, 0, (len(leaves)+1)/2)
		for i := 0; i < len(leaves); i += 2 {
			left := leaves[i]
			right := left
			if i+1 < len(leaves) {
				right = leaves[i+1]
			}
			sum := sha256.Sum256([]byte(left + right))
			next = append(next, hex.EncodeToString(sum[:]))
		}
		leaves = next
	}
	return leaves[0], nil
}

func hashTransfer(transfer Transfer) string {
	body, _ := json.Marshal(transfer)
	sum := sha256.Sum256(body)
	return hex.EncodeToString(sum[:])
}

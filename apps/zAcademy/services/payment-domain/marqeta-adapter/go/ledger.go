package marqeta

import "context"

type LedgerEntry struct {
	Token    string `json:"token"`
	Amount   int64  `json:"amount"`
	Currency string `json:"currency_code"`
	Type     string `json:"entry_type"`
}

func (c *Client) GetLedgerEntries(ctx context.Context, accountToken string) ([]LedgerEntry, error) {
	var out struct {
		Data []LedgerEntry `json:"data"`
	}
	err := c.doJSON(ctx, "GET", "/ledger/accounts/"+accountToken+"/entries", nil, &out)
	return out.Data, err
}

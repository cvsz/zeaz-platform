package marqeta

import "context"

type Transaction struct {
	Token    string `json:"token"`
	State    string `json:"state"`
	Amount   int64  `json:"amount"`
	Currency string `json:"currency_code"`
}

func (c *Client) GetTransaction(ctx context.Context, token string) (Transaction, error) {
	var out Transaction
	err := c.doJSON(ctx, "GET", "/transactions/"+token, nil, &out)
	return out, err
}

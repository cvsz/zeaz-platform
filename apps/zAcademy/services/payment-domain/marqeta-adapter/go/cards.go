package marqeta

import "context"

type CreateCardRequest struct {
	UserToken string `json:"user_token"`
	Type      string `json:"card_product_token,omitempty"`
}

type Card struct {
	Token string `json:"token"`
	State string `json:"state"`
}

func (c *Client) CreateVirtualCard(ctx context.Context, in CreateCardRequest) (Card, error) {
	var out Card
	err := c.doJSON(ctx, "POST", "/cards", in, &out)
	return out, err
}

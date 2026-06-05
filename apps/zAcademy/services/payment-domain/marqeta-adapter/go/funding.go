package marqeta

import "context"

type FundingRequest struct {
	UserToken string `json:"user_token"`
	Amount    int64  `json:"amount"`
	Currency  string `json:"currency_code"`
	Reference string `json:"reference"`
}

type FundingResponse struct {
	Token  string `json:"token"`
	Status string `json:"status"`
}

func (c *Client) FundUser(ctx context.Context, in FundingRequest) (FundingResponse, error) {
	var out FundingResponse
	err := c.doJSON(ctx, "POST", "/gpaorders", in, &out)
	return out, err
}

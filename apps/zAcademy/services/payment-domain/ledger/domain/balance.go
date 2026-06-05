package domain

import "errors"

var (
	ErrInvalidCurrency = errors.New("invalid currency")
	ErrNegativeAmount  = errors.New("negative amount")
)

type Balance struct {
	Currency string
	Amount   int64
}

func NewBalance(currency string, amount int64) (Balance, error) {
	if currency == "" {
		return Balance{}, ErrInvalidCurrency
	}
	if amount < 0 {
		return Balance{}, ErrNegativeAmount
	}
	return Balance{Currency: currency, Amount: amount}, nil
}

func (b Balance) Credit(amount int64) (Balance, error) {
	if amount < 0 {
		return Balance{}, ErrNegativeAmount
	}
	return Balance{Currency: b.Currency, Amount: b.Amount + amount}, nil
}

func (b Balance) Debit(amount int64) (Balance, error) {
	if amount < 0 {
		return Balance{}, ErrNegativeAmount
	}
	if b.Amount < amount {
		return Balance{}, ErrInsufficientFunds
	}
	return Balance{Currency: b.Currency, Amount: b.Amount - amount}, nil
}

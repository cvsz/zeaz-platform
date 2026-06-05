package domain

import (
	"errors"
	"time"
)

var (
	ErrInvalidAccountID  = errors.New("invalid account id")
	ErrInsufficientFunds = errors.New("insufficient funds")
)

type Account struct {
	ID        string
	Balance   Balance
	Version   int64
	CreatedAt time.Time
	UpdatedAt time.Time
}

func NewAccount(id string, currency string, openingAmount int64, now time.Time) (Account, error) {
	if id == "" {
		return Account{}, ErrInvalidAccountID
	}
	b, err := NewBalance(currency, openingAmount)
	if err != nil {
		return Account{}, err
	}
	t := now.UTC()
	return Account{ID: id, Balance: b, Version: 1, CreatedAt: t, UpdatedAt: t}, nil
}

func (a Account) ApplyDelta(delta int64, now time.Time) (Account, error) {
	updated := a
	var err error
	if delta >= 0 {
		updated.Balance, err = a.Balance.Credit(delta)
	} else {
		updated.Balance, err = a.Balance.Debit(-delta)
	}
	if err != nil {
		return Account{}, err
	}
	updated.Version = a.Version + 1
	updated.UpdatedAt = now.UTC()
	return updated, nil
}

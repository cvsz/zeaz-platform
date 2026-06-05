package domain

import (
	"errors"
	"fmt"
	"time"
)

var (
	ErrSameAccountPosting = errors.New("debit and credit account must differ")
)

type Posting struct {
	ID              string
	DebitAccountID  string
	CreditAccountID string
	Amount          int64
	Currency        string
	Description     string
	OccurredAt      time.Time
}

func NewPosting(id, debitAccountID, creditAccountID string, amount int64, currency, description string, occurredAt time.Time) (Posting, error) {
	p := Posting{
		ID: id, DebitAccountID: debitAccountID, CreditAccountID: creditAccountID,
		Amount: amount, Currency: currency, Description: description, OccurredAt: occurredAt.UTC(),
	}
	if err := p.Validate(); err != nil {
		return Posting{}, err
	}
	return p, nil
}

func (p Posting) Validate() error {
	if p.ID == "" {
		return ErrInvalidPostingID
	}
	if p.DebitAccountID == "" || p.CreditAccountID == "" {
		return ErrInvalidAccountRef
	}
	if p.DebitAccountID == p.CreditAccountID {
		return ErrSameAccountPosting
	}
	if p.Amount <= 0 {
		return ErrNonPositiveAmount
	}
	if p.Currency == "" {
		return ErrInvalidCurrency
	}
	return nil
}

func (p Posting) ToEntries(now time.Time) (Entry, Entry, error) {
	if err := p.Validate(); err != nil {
		return Entry{}, Entry{}, err
	}
	debit, err := NewEntry(fmt.Sprintf("%s-d", p.ID), p.ID, p.DebitAccountID, Debit, p.Amount, p.Currency, p.Description, now)
	if err != nil {
		return Entry{}, Entry{}, err
	}
	credit, err := NewEntry(fmt.Sprintf("%s-c", p.ID), p.ID, p.CreditAccountID, Credit, p.Amount, p.Currency, p.Description, now)
	if err != nil {
		return Entry{}, Entry{}, err
	}
	return debit, credit, nil
}

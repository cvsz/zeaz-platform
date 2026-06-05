package domain

import (
	"errors"
	"time"
)

var (
	ErrInvalidEntryID    = errors.New("invalid entry id")
	ErrInvalidPostingID  = errors.New("invalid posting id")
	ErrInvalidDirection  = errors.New("invalid direction")
	ErrNonPositiveAmount = errors.New("amount must be positive")
	ErrInvalidAccountRef = errors.New("invalid account reference")
)

type EntryDirection string

const (
	Debit  EntryDirection = "debit"
	Credit EntryDirection = "credit"
)

type Entry struct {
	id          string
	postingID   string
	accountID   string
	direction   EntryDirection
	amount      int64
	currency    string
	createdAt   time.Time
	description string
}

func NewEntry(id, postingID, accountID string, direction EntryDirection, amount int64, currency, description string, now time.Time) (Entry, error) {
	if id == "" {
		return Entry{}, ErrInvalidEntryID
	}
	if postingID == "" {
		return Entry{}, ErrInvalidPostingID
	}
	if accountID == "" {
		return Entry{}, ErrInvalidAccountRef
	}
	if direction != Debit && direction != Credit {
		return Entry{}, ErrInvalidDirection
	}
	if amount <= 0 {
		return Entry{}, ErrNonPositiveAmount
	}
	if currency == "" {
		return Entry{}, ErrInvalidCurrency
	}
	return Entry{
		id: id, postingID: postingID, accountID: accountID, direction: direction,
		amount: amount, currency: currency, createdAt: now.UTC(), description: description,
	}, nil
}

func (e Entry) ID() string                { return e.id }
func (e Entry) PostingID() string         { return e.postingID }
func (e Entry) AccountID() string         { return e.accountID }
func (e Entry) Direction() EntryDirection { return e.direction }
func (e Entry) Amount() int64             { return e.amount }
func (e Entry) Currency() string          { return e.currency }
func (e Entry) CreatedAt() time.Time      { return e.createdAt }
func (e Entry) Description() string       { return e.description }

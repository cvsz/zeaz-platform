package domain

import (
	"testing"
	"time"
)

func TestPostingToEntries_DoubleEntryBalanced(t *testing.T) {
	now := time.Now().UTC()
	p, err := NewPosting("p1", "a-debit", "a-credit", 1250, "USD", "settlement", now)
	if err != nil {
		t.Fatalf("new posting: %v", err)
	}
	d, c, err := p.ToEntries(now)
	if err != nil {
		t.Fatalf("to entries: %v", err)
	}
	if d.Direction() != Debit || c.Direction() != Credit {
		t.Fatalf("unexpected directions: %s/%s", d.Direction(), c.Direction())
	}
	if d.Amount() != c.Amount() {
		t.Fatalf("entries unbalanced: debit=%d credit=%d", d.Amount(), c.Amount())
	}
	if d.AccountID() != "a-debit" || c.AccountID() != "a-credit" {
		t.Fatalf("unexpected account mapping")
	}
}

func TestEntryImmutableByAPI(t *testing.T) {
	e, err := NewEntry("e1", "p1", "a1", Debit, 10, "USD", "d", time.Now().UTC())
	if err != nil {
		t.Fatalf("new entry: %v", err)
	}
	if e.ID() != "e1" || e.Amount() != 10 {
		t.Fatalf("entry getters mismatch")
	}
}

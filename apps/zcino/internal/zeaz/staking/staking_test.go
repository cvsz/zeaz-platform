package staking_test

import (
	"testing"
	"time"

	"game-catalog-service/internal/zeaz/staking"
)

func TestSlashJailsAndReducesStake(t *testing.T) {
	pool := staking.NewPool(10)
	if err := pool.Bond(staking.Validator{ID: "val-a", ConsensusKey: "key-a", Stake: 100}); err != nil {
		t.Fatal(err)
	}
	updated, err := pool.Slash("val-a", 0.25, "double-sign", time.Hour, time.Unix(10, 0))
	if err != nil {
		t.Fatal(err)
	}
	if updated.Stake != 75 || updated.Status != staking.StatusJailed || updated.SlashCount != 1 {
		t.Fatalf("updated validator = %+v, want 75 stake and jailed", updated)
	}
	if got := pool.ActiveValidators(time.Unix(20, 0)); len(got) != 0 {
		t.Fatalf("active validators while jailed = %d, want 0", len(got))
	}
}

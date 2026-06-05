package staking

import (
	"fmt"
	"sort"
	"sync"
	"time"
)

type ValidatorStatus string

const (
	StatusBonded   ValidatorStatus = "bonded"
	StatusUnbonded ValidatorStatus = "unbonded"
	StatusJailed   ValidatorStatus = "jailed"
)

type Validator struct {
	ID              string          `json:"id"`
	OperatorAddress string          `json:"operator_address"`
	ConsensusKey    string          `json:"consensus_key"`
	Stake           uint64          `json:"stake"`
	DelegatedStake  uint64          `json:"delegated_stake"`
	Status          ValidatorStatus `json:"status"`
	JailedUntil     time.Time       `json:"jailed_until,omitempty"`
	SlashCount      int             `json:"slash_count"`
}

type Event struct {
	Type        string    `json:"type"`
	ValidatorID string    `json:"validator_id"`
	Amount      uint64    `json:"amount,omitempty"`
	Reason      string    `json:"reason,omitempty"`
	At          time.Time `json:"at"`
}

type Pool struct {
	mu         sync.RWMutex
	minStake   uint64
	validators map[string]Validator
	events     []Event
}

func NewPool(minStake uint64) *Pool {
	if minStake == 0 {
		minStake = 1
	}
	return &Pool{minStake: minStake, validators: map[string]Validator{}}
}

func (p *Pool) Bond(v Validator) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	if v.ID == "" || v.ConsensusKey == "" {
		return fmt.Errorf("validator id and consensus key are required")
	}
	if v.Stake+v.DelegatedStake < p.minStake {
		return fmt.Errorf("validator %q stake %d is below minimum %d", v.ID, v.Stake+v.DelegatedStake, p.minStake)
	}
	v.Status = StatusBonded
	v.JailedUntil = time.Time{}
	p.validators[v.ID] = v
	p.appendEvent("bond", v.ID, v.Stake+v.DelegatedStake, "")
	return nil
}

func (p *Pool) Unbond(id string) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	v, ok := p.validators[id]
	if !ok {
		return fmt.Errorf("unknown validator %q", id)
	}
	v.Status = StatusUnbonded
	p.validators[id] = v
	p.appendEvent("unbond", id, v.Stake+v.DelegatedStake, "")
	return nil
}

func (p *Pool) Slash(id string, fraction float64, reason string, jailFor time.Duration, now time.Time) (Validator, error) {
	p.mu.Lock()
	defer p.mu.Unlock()
	v, ok := p.validators[id]
	if !ok {
		return Validator{}, fmt.Errorf("unknown validator %q", id)
	}
	if fraction <= 0 || fraction > 1 {
		return Validator{}, fmt.Errorf("slash fraction must be in (0,1]")
	}
	total := v.Stake + v.DelegatedStake
	amount := uint64(float64(total) * fraction)
	if amount == 0 && total > 0 {
		amount = 1
	}
	if amount >= v.Stake {
		amount -= v.Stake
		v.Stake = 0
		if amount >= v.DelegatedStake {
			v.DelegatedStake = 0
		} else {
			v.DelegatedStake -= amount
		}
	} else {
		v.Stake -= amount
	}
	burned := total - (v.Stake + v.DelegatedStake)
	v.SlashCount++
	if jailFor > 0 {
		v.Status = StatusJailed
		v.JailedUntil = now.Add(jailFor).UTC()
	}
	if v.Stake+v.DelegatedStake < p.minStake && v.Status != StatusJailed {
		v.Status = StatusUnbonded
	}
	p.validators[id] = v
	p.appendEvent("slash", id, burned, reason)
	return v, nil
}

func (p *Pool) ActiveValidators(now time.Time) []Validator {
	p.mu.RLock()
	defer p.mu.RUnlock()
	out := make([]Validator, 0, len(p.validators))
	for _, v := range p.validators {
		if v.Status == StatusBonded && v.Stake+v.DelegatedStake >= p.minStake {
			out = append(out, v)
			continue
		}
		if v.Status == StatusJailed && !v.JailedUntil.IsZero() && now.After(v.JailedUntil) && v.Stake+v.DelegatedStake >= p.minStake {
			v.Status = StatusBonded
			out = append(out, v)
		}
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Stake+out[i].DelegatedStake == out[j].Stake+out[j].DelegatedStake {
			return out[i].ID < out[j].ID
		}
		return out[i].Stake+out[i].DelegatedStake > out[j].Stake+out[j].DelegatedStake
	})
	return out
}

func (p *Pool) Events() []Event {
	p.mu.RLock()
	defer p.mu.RUnlock()
	return append([]Event(nil), p.events...)
}

func (p *Pool) appendEvent(kind, validatorID string, amount uint64, reason string) {
	p.events = append(p.events, Event{Type: kind, ValidatorID: validatorID, Amount: amount, Reason: reason, At: time.Now().UTC()})
}

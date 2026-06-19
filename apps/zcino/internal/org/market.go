package org

import (
	"fmt"
	"math"
	"sort"
	"strings"
)

type Task struct {
	ID       string
	Name     string
	Org      string
	Budget   float64
	Critical bool
}

type Bid struct {
	AgentID string
	Cost    float64
	Score   float64
}

type Allocation struct {
	Task   Task
	Bid    Bid
	Reason string
}

func SelectBestBid(task Task, bids []Bid) (Allocation, error) {
	if strings.TrimSpace(task.ID) == "" {
		return Allocation{}, fmt.Errorf("task id is required")
	}
	if task.Budget < 0 {
		return Allocation{}, fmt.Errorf("task budget cannot be negative")
	}
	eligible := make([]Bid, 0, len(bids))
	for _, bid := range bids {
		if strings.TrimSpace(bid.AgentID) == "" || bid.Cost < 0 || math.IsNaN(bid.Score) || math.IsInf(bid.Score, 0) {
			continue
		}
		if task.Budget > 0 && bid.Cost > task.Budget {
			continue
		}
		eligible = append(eligible, bid)
	}
	if len(eligible) == 0 {
		return Allocation{}, fmt.Errorf("no eligible bids for task %q", task.ID)
	}
	sort.SliceStable(eligible, func(i, j int) bool {
		if eligible[i].Score == eligible[j].Score {
			return eligible[i].Cost < eligible[j].Cost
		}
		return eligible[i].Score > eligible[j].Score
	})
	return Allocation{Task: task, Bid: eligible[0], Reason: "selected highest score within task budget"}, nil
}

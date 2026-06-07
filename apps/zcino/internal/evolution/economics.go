package evolution

import "fmt"

type EconomicController struct {
	budget Budget
}

func NewEconomicController(budget Budget) EconomicController {
	return EconomicController{budget: budget}
}

func (c EconomicController) Evaluate(p Proposal) Evaluation {
	if c.budget.HourlyLimit <= 0 {
		return Evaluation{Allowed: true, Reason: "no budget limit configured"}
	}
	if p.EstimatedCost < 0 {
		return Evaluation{Reason: "estimated cost cannot be negative"}
	}
	if p.EstimatedCost > c.budget.Remaining() {
		return Evaluation{Reason: fmt.Sprintf("estimated cost %.2f exceeds remaining budget %.2f", p.EstimatedCost, c.budget.Remaining())}
	}
	return Evaluation{Allowed: true, Reason: "budget accepted proposal"}
}

func Reward(revenue float64, cost float64, errors float64) float64 {
	if cost < 0 {
		cost = 0
	}
	if errors < 0 {
		errors = 0
	}
	return revenue - cost - (errors * 5)
}

package interop

import "fmt"

// NormalizeResponse converts heterogeneous partner payloads into the stable V8
// response contract. It accepts common bool/float encodings and rejects missing
// or invalid score values instead of panicking on bad partner data.
func NormalizeResponse(raw map[string]any) (Response, error) {
	score, ok := raw["score"]
	if !ok {
		return Response{}, fmt.Errorf("missing score")
	}

	var normalizedScore float64
	switch v := score.(type) {
	case float64:
		normalizedScore = v
	case float32:
		normalizedScore = float64(v)
	case int:
		normalizedScore = float64(v)
	default:
		return Response{}, fmt.Errorf("invalid score type %T", score)
	}

	accepted := false
	if v, ok := raw["accepted"].(bool); ok {
		accepted = v
	}

	reason := ""
	if v, ok := raw["reason"].(string); ok {
		reason = v
	}

	return Response{Accepted: accepted, Score: normalizedScore, Reason: reason}, nil
}

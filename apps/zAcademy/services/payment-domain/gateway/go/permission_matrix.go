package gateway

type PermissionMatrix struct {
	byRole map[string]map[string]struct{}
}

func NewPermissionMatrix(seed map[string][]string) *PermissionMatrix {
	m := &PermissionMatrix{byRole: make(map[string]map[string]struct{}, len(seed))}
	for role, scopes := range seed {
		set := make(map[string]struct{}, len(scopes))
		for _, scope := range NormalizeScopes(scopes) {
			set[scope] = struct{}{}
		}
		m.byRole[role] = set
	}
	return m
}

func DefaultPaymentPermissionMatrix() *PermissionMatrix {
	return NewPermissionMatrix(map[string][]string{
		"payment_viewer":   {ScopePaymentRead},
		"payment_operator": {ScopePaymentRead, ScopePaymentWrite, ScopePaymentRefund},
		"payment_admin":    {ScopePaymentRead, ScopePaymentWrite, ScopePaymentRefund, ScopePaymentAdmin},
	})
}

func (m *PermissionMatrix) Allows(roles []string, scope string) bool {
	if m == nil {
		return false
	}
	scope = NormalizeScopes([]string{scope})[0]
	for _, role := range roles {
		if scopes, ok := m.byRole[role]; ok {
			if _, ok := scopes[scope]; ok {
				return true
			}
		}
	}
	return false
}

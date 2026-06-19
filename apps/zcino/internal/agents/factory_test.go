package agents

import "testing"

func TestFactoryCreatesScopedAgent(t *testing.T) {
	agent, err := NewFactory(nil).Create(KindSEO, "Improve Organic Landing Pages")
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if agent.Name != "agent_improve_organic_landing_pages" {
		t.Fatalf("name = %q", agent.Name)
	}
	if agent.PolicyScope != "seo:sandbox" {
		t.Fatalf("policy scope = %q", agent.PolicyScope)
	}
}

func TestFactoryRejectsDisallowedAgentKind(t *testing.T) {
	_, err := NewFactory(map[string]bool{KindAnomaly: true}).Create(KindInfra, "scale nodes")
	if err == nil {
		t.Fatal("disallowed kind should fail")
	}
}

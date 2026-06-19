package protocol

import "testing"

func TestNegotiateVersionAcceptsCompatiblePeer(t *testing.T) {
	result := NegotiateVersion(Version{Major: CurrentMajor, Minor: CurrentMinor, Patch: CurrentPatch + 1}, []string{"governance-vote", "economic-rule"})
	if !result.Accepted {
		t.Fatalf("expected compatible version to be accepted: %+v", result)
	}
	if result.Version.Major != CurrentMajor || result.Version.Minor != CurrentMinor || result.Version.Patch != CurrentPatch {
		t.Fatalf("unexpected negotiated version: %+v", result.Version)
	}
	if len(result.Features) != 2 || result.Features[0] != "governance-vote" {
		t.Fatalf("features were not preserved: %+v", result.Features)
	}
}

func TestNegotiateVersionRejectsBreakingMajor(t *testing.T) {
	result := NegotiateVersion(Version{Major: CurrentMajor + 1, Minor: 0, Patch: 0}, nil)
	if result.Accepted {
		t.Fatalf("expected incompatible major to be rejected: %+v", result)
	}
	if result.Version != CurrentVersion() {
		t.Fatalf("expected node current version in rejection: %+v", result.Version)
	}
}

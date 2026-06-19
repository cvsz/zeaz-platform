package main

import "testing"

func TestLoadBlockedCountriesDefaults(t *testing.T) {
	blocked := loadBlockedCountries("")
	if !blocked["TH"] || !blocked["CN"] {
		t.Fatalf("expected default blocked countries TH and CN, got %#v", blocked)
	}
}

func TestLoadBlockedCountriesNormalizesInput(t *testing.T) {
	blocked := loadBlockedCountries(" us, gb ,,De ")
	for _, country := range []string{"US", "GB", "DE"} {
		if !blocked[country] {
			t.Fatalf("expected %s to be blocked in %#v", country, blocked)
		}
	}
	if blocked[""] {
		t.Fatalf("empty country should not be recorded")
	}
}

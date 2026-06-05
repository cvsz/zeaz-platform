package main

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"time"
)

type complianceResponse struct {
	Country string `json:"country"`
	Allowed bool   `json:"allowed"`
	Reason  string `json:"reason,omitempty"`
}

type enforcer struct {
	blockedCountries map[string]bool
}

func main() {
	enf := enforcer{blockedCountries: loadBlockedCountries(os.Getenv("BLOCKED_COUNTRIES"))}
	address := getEnv("COMPLIANCE_HTTP_ADDRESS", ":8082")

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) })
	mux.HandleFunc("GET /check", enf.check)
	mux.HandleFunc("POST /ingress/authorize", enf.check)

	server := &http.Server{
		Addr:              address,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	log.Printf("compliance service listening on %s", address)
	log.Fatal(server.ListenAndServe())
}

func (e enforcer) check(w http.ResponseWriter, r *http.Request) {
	country := countryFromRequest(r)
	allowed := country == "" || !e.blockedCountries[country]
	response := complianceResponse{Country: country, Allowed: allowed}
	status := http.StatusOK
	if !allowed {
		status = http.StatusForbidden
		response.Reason = "restricted jurisdiction"
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Vary", "CF-IPCountry, X-Country-Code, X-Geo-Country")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(response)
}

func countryFromRequest(r *http.Request) string {
	candidates := []string{
		r.URL.Query().Get("country"),
		r.Header.Get("CF-IPCountry"),
		r.Header.Get("X-Country-Code"),
		r.Header.Get("X-Geo-Country"),
	}
	for _, candidate := range candidates {
		country := strings.ToUpper(strings.TrimSpace(candidate))
		if len(country) == 2 {
			return country
		}
	}
	if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil && host == "127.0.0.1" {
		return ""
	}
	return ""
}

func loadBlockedCountries(value string) map[string]bool {
	if value == "" {
		value = "TH,CN"
	}
	blocked := make(map[string]bool)
	for _, country := range strings.Split(value, ",") {
		country = strings.ToUpper(strings.TrimSpace(country))
		if len(country) == 2 {
			blocked[country] = true
		}
	}
	blocked["TH"] = true
	return blocked
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}

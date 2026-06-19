package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"game-catalog-service/internal/ecosystem"
	"game-catalog-service/internal/zeaz/discovery"
	"game-catalog-service/internal/zeaz/ledger"
	"game-catalog-service/internal/zeaz/node"
	"game-catalog-service/internal/zeaz/protocol"
	"game-catalog-service/internal/zeaz/runtime"
)

func main() {
	orgID := getenv("ZEAZ_ORG_ID", "org-bootstrap")
	nodeID := getenv("ZEAZ_NODE_ID", "node-0")
	publicAddr := getenv("ZEAZ_PUBLIC_ADDR", "http://localhost:8090")
	networkID := getenv("ZEAZ_NETWORK_ID", "zeaz-localnet")
	wallet, err := runtime.NewWallet(orgID)
	if err != nil {
		log.Fatal(err)
	}
	ledgerService := ledger.NewService(ledger.Org{ID: orgID, Name: orgID, PublicKey: wallet.PublicKey, Active: true})
	bootstrap := discovery.NewBootstrapNetwork(2 * time.Minute)
	gov := ecosystem.NewGovernance(ecosystem.Guardrails{})
	gov.Quorum = 1
	bootstrap.Announce(protocol.Peer{NodeID: nodeID, OrgID: orgID, Address: publicAddr, PublicKey: wallet.PublicKeyString()})

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	mux.HandleFunc("GET /version", writeJSON(protocol.CurrentVersion()))
	mux.HandleFunc("POST /version/negotiate", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Version  protocol.Version `json:"version"`
			Features []string         `json:"features"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		writeJSON(protocol.NegotiateVersion(req.Version, []string{"libp2p.gossipsub", "consensus.hotstuff", "consensus.tendermint", "staking.slashing", "settlement.receipts", "wasm.execution", "ledger.hash_chain", "governance.voting", "discovery.bootstrap"}))(w, r)
	})
	mux.HandleFunc("GET /ledger", func(w http.ResponseWriter, r *http.Request) { writeJSON(ledgerService.Snapshot())(w, r) })
	mux.HandleFunc("GET /node/manifest", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(node.FullValidatorManifest(nodeID, networkID, []string{getenv("ZEAZ_P2P_LISTEN", "/ip4/0.0.0.0/tcp/0")}, addrFromRequest(r), time.Now().UTC()))(w, r)
	})
	mux.HandleFunc("POST /envelopes", func(w http.ResponseWriter, r *http.Request) {
		var env protocol.Envelope
		if err := json.NewDecoder(r.Body).Decode(&env); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		record, err := ledgerService.SubmitEnvelope(r.Context(), env)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnprocessableEntity)
			return
		}
		writeJSON(record)(w, r)
	})

	mux.HandleFunc("GET /governance/proposals", func(w http.ResponseWriter, r *http.Request) { writeJSON(gov.Proposals())(w, r) })
	mux.HandleFunc("POST /governance/proposals", func(w http.ResponseWriter, r *http.Request) {
		var proposal ecosystem.Proposal
		if err := json.NewDecoder(r.Body).Decode(&proposal); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := gov.SubmitProposal(proposal); err != nil {
			http.Error(w, err.Error(), http.StatusUnprocessableEntity)
			return
		}
		created, _ := gov.Proposal(proposal.ID)
		writeJSON(created)(w, r)
	})
	mux.HandleFunc("POST /governance/proposals/{id}/votes", func(w http.ResponseWriter, r *http.Request) {
		id := strings.TrimSpace(r.PathValue("id"))
		var vote ecosystem.Vote
		if err := json.NewDecoder(r.Body).Decode(&vote); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := gov.CastVote(id, vote, time.Now().UTC()); err != nil {
			http.Error(w, err.Error(), http.StatusUnprocessableEntity)
			return
		}
		writeJSON(map[string]bool{"accepted": true})(w, r)
	})
	mux.HandleFunc("GET /governance/proposals/{id}/tally", func(w http.ResponseWriter, r *http.Request) {
		tally, err := gov.Tally(strings.TrimSpace(r.PathValue("id")), time.Now().UTC())
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		writeJSON(tally)(w, r)
	})
	mux.HandleFunc("GET /peers", func(w http.ResponseWriter, r *http.Request) { writeJSON(bootstrap.Peers(time.Now().UTC()))(w, r) })
	mux.HandleFunc("POST /peers", func(w http.ResponseWriter, r *http.Request) {
		var peer protocol.Peer
		if err := json.NewDecoder(r.Body).Decode(&peer); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		writeJSON(bootstrap.Announce(peer))(w, r)
	})
	addr := getenv("ZEAZ_HTTP_ADDRESS", ":8090")
	log.Printf("zeaz node listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

func writeJSON(value any) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(value)
	}
}
func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
func addrFromRequest(r *http.Request) string {
	if r.Host != "" {
		return r.Host
	}
	return getenv("ZEAZ_HTTP_ADDRESS", ":8090")
}

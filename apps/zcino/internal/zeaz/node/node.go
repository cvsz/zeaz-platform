package node

import "time"

type Role string

const (
	RoleFullValidator Role = "full_validator"
	RoleSentry        Role = "sentry"
	RoleRPC           Role = "rpc"
	RoleArchive       Role = "archive"
)

type Capability string

const (
	CapabilityLibP2P       Capability = "libp2p.gossipsub"
	CapabilityHotStuff     Capability = "consensus.hotstuff"
	CapabilityTendermint   Capability = "consensus.tendermint"
	CapabilityStaking      Capability = "staking.slashing"
	CapabilitySettlement   Capability = "settlement.receipts"
	CapabilityWASM         Capability = "wasm.execution"
	CapabilityHashLedger   Capability = "ledger.hash_chain"
	CapabilityGovernance   Capability = "governance.voting"
	CapabilityBootstrapDHT Capability = "discovery.bootstrap"
)

type Manifest struct {
	NodeID       string       `json:"node_id"`
	NetworkID    string       `json:"network_id"`
	Role         Role         `json:"role"`
	Capabilities []Capability `json:"capabilities"`
	P2PListen    []string     `json:"p2p_listen,omitempty"`
	RPCListen    string       `json:"rpc_listen,omitempty"`
	StartedAt    time.Time    `json:"started_at"`
}

func FullValidatorManifest(nodeID, networkID string, p2pListen []string, rpcListen string, startedAt time.Time) Manifest {
	return Manifest{NodeID: nodeID, NetworkID: networkID, Role: RoleFullValidator, Capabilities: []Capability{CapabilityLibP2P, CapabilityHotStuff, CapabilityTendermint, CapabilityStaking, CapabilitySettlement, CapabilityWASM, CapabilityHashLedger, CapabilityGovernance, CapabilityBootstrapDHT}, P2PListen: append([]string(nil), p2pListen...), RPCListen: rpcListen, StartedAt: startedAt.UTC()}
}

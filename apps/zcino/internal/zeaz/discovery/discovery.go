package discovery

import (
	"sort"
	"sync"
	"time"

	"game-catalog-service/internal/zeaz/protocol"
)

type BootstrapNetwork struct {
	mu    sync.RWMutex
	peers map[string]protocol.Peer
	ttl   time.Duration
}

func NewBootstrapNetwork(ttl time.Duration) *BootstrapNetwork {
	if ttl <= 0 {
		ttl = 2 * time.Minute
	}
	return &BootstrapNetwork{peers: map[string]protocol.Peer{}, ttl: ttl}
}

func (n *BootstrapNetwork) Announce(peer protocol.Peer) protocol.Peer {
	n.mu.Lock()
	defer n.mu.Unlock()
	if peer.SeenAt.IsZero() {
		peer.SeenAt = time.Now().UTC()
	}
	n.peers[peer.NodeID] = peer
	return peer
}

func (n *BootstrapNetwork) Peers(now time.Time) []protocol.Peer {
	n.mu.RLock()
	defer n.mu.RUnlock()
	peers := make([]protocol.Peer, 0, len(n.peers))
	for _, peer := range n.peers {
		if now.Sub(peer.SeenAt) <= n.ttl {
			peers = append(peers, peer)
		}
	}
	sort.Slice(peers, func(i, j int) bool { return peers[i].NodeID < peers[j].NodeID })
	return peers
}

func (n *BootstrapNetwork) ForgetExpired(now time.Time) int {
	n.mu.Lock()
	defer n.mu.Unlock()
	removed := 0
	for id, peer := range n.peers {
		if now.Sub(peer.SeenAt) > n.ttl {
			delete(n.peers, id)
			removed++
		}
	}
	return removed
}

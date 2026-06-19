package p2p

import (
	"context"
	"fmt"

	libp2p "github.com/libp2p/go-libp2p"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/core/protocol"
	multiaddr "github.com/multiformats/go-multiaddr"
)

const (
	ProtocolID     protocol.ID = "/zeaz/validator/1.0.0"
	ConsensusTopic             = "zeaz.consensus.v1"
	MempoolTopic               = "zeaz.mempool.v1"
)

type Config struct {
	ListenAddrs []string
	Bootstrap   []string
	UserAgent   string
}

type Node struct {
	Host   host.Host
	PubSub *pubsub.PubSub
}

func NewNode(ctx context.Context, cfg Config) (*Node, error) {
	options := []libp2p.Option{libp2p.ProtocolVersion(string(ProtocolID))}
	if cfg.UserAgent != "" {
		options = append(options, libp2p.UserAgent(cfg.UserAgent))
	}
	if len(cfg.ListenAddrs) > 0 {
		addrs := make([]multiaddr.Multiaddr, 0, len(cfg.ListenAddrs))
		for _, raw := range cfg.ListenAddrs {
			addr, err := multiaddr.NewMultiaddr(raw)
			if err != nil {
				return nil, fmt.Errorf("parse listen addr %q: %w", raw, err)
			}
			addrs = append(addrs, addr)
		}
		options = append(options, libp2p.ListenAddrs(addrs...))
	}
	h, err := libp2p.New(options...)
	if err != nil {
		return nil, err
	}
	ps, err := pubsub.NewGossipSub(ctx, h)
	if err != nil {
		_ = h.Close()
		return nil, err
	}
	n := &Node{Host: h, PubSub: ps}
	for _, raw := range cfg.Bootstrap {
		info, err := peer.AddrInfoFromString(raw)
		if err != nil {
			_ = h.Close()
			return nil, fmt.Errorf("parse bootstrap peer %q: %w", raw, err)
		}
		if err := h.Connect(ctx, *info); err != nil {
			_ = h.Close()
			return nil, fmt.Errorf("connect bootstrap peer %q: %w", raw, err)
		}
	}
	return n, nil
}

func (n *Node) JoinTopic(ctx context.Context, topicName string) (*pubsub.Topic, *pubsub.Subscription, error) {
	if n == nil || n.PubSub == nil {
		return nil, nil, fmt.Errorf("p2p node is not initialized")
	}
	topic, err := n.PubSub.Join(topicName)
	if err != nil {
		return nil, nil, err
	}
	sub, err := topic.Subscribe()
	if err != nil {
		_ = topic.Close()
		return nil, nil, err
	}
	go func() {
		<-ctx.Done()
		sub.Cancel()
		_ = topic.Close()
	}()
	return topic, sub, nil
}

func (n *Node) Close() error {
	if n == nil || n.Host == nil {
		return nil
	}
	return n.Host.Close()
}

package consensus_test

import (
	"crypto/ed25519"
	"crypto/rand"
	"testing"
	"time"

	"game-catalog-service/internal/zeaz/consensus"
)

func TestHotStuffCommitRequiresTwoThirdsSignedPower(t *testing.T) {
	pubA, privA, _ := ed25519.GenerateKey(rand.Reader)
	pubB, privB, _ := ed25519.GenerateKey(rand.Reader)
	pubC, privC, _ := ed25519.GenerateKey(rand.Reader)
	engine, err := consensus.NewEngine(consensus.AlgorithmHotStuff, []consensus.Validator{{ID: "a", Power: 1, PublicKey: pubA}, {ID: "b", Power: 1, PublicKey: pubB}, {ID: "c", Power: 1, PublicKey: pubC}})
	if err != nil {
		t.Fatal(err)
	}
	proposal := consensus.Proposal{Height: 1, Round: 0, ProposerID: "a", ParentHash: "genesis", PayloadHash: "payload", Timestamp: time.Unix(1, 0).UTC()}
	blockHash := consensus.HashProposal(proposal)
	voteA, _ := consensus.SignVote(consensus.Vote{Height: 1, Round: 0, Phase: consensus.PhaseCommit, BlockHash: blockHash, ValidatorID: "a", At: time.Now()}, privA)
	qc, ok, err := engine.AddVote(voteA)
	if err != nil || ok {
		t.Fatalf("first vote qc=(%+v,%v) err=%v, want no quorum", qc, ok, err)
	}
	voteB, _ := consensus.SignVote(consensus.Vote{Height: 1, Round: 0, Phase: consensus.PhaseCommit, BlockHash: blockHash, ValidatorID: "b", At: time.Now()}, privB)
	qc, ok, err = engine.AddVote(voteB)
	if err != nil || ok {
		t.Fatalf("second vote qc=(%+v,%v) err=%v, want no quorum until >2/3", qc, ok, err)
	}
	voteC, _ := consensus.SignVote(consensus.Vote{Height: 1, Round: 0, Phase: consensus.PhaseCommit, BlockHash: blockHash, ValidatorID: "c", At: time.Now()}, privC)
	qc, ok, err = engine.AddVote(voteC)
	if err != nil || !ok {
		t.Fatalf("third vote qc=(%+v,%v) err=%v, want quorum", qc, ok, err)
	}
	if _, err := engine.Commit(proposal, qc, time.Now()); err != nil {
		t.Fatalf("commit: %v", err)
	}
}

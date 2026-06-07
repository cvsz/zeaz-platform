package org

import "time"

type Memory struct {
	Strategy   string
	Score      float64
	Succeeded  bool
	RecordedAt time.Time
}

type MemoryStore struct {
	entries []Memory
}

func (s *MemoryStore) Record(memory Memory) {
	if memory.RecordedAt.IsZero() {
		memory.RecordedAt = time.Now().UTC()
	}
	s.entries = append(s.entries, memory)
}

func (s MemoryStore) BestStrategy() (Memory, bool) {
	if len(s.entries) == 0 {
		return Memory{}, false
	}
	best := s.entries[0]
	for _, entry := range s.entries[1:] {
		if entry.Score > best.Score {
			best = entry
		}
	}
	return best, true
}

func (s MemoryStore) Entries() []Memory {
	entries := make([]Memory, len(s.entries))
	copy(entries, s.entries)
	return entries
}

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"game-catalog-service/internal/events"

	"github.com/nats-io/nats.go"
)

func main() {
	natsURL := getenv("NATS_URL", "nats://localhost:4222")
	nc, err := nats.Connect(natsURL, nats.Name("zeaz-analytics-consumer"))
	if err != nil {
		log.Fatalf("connect nats: %v", err)
	}
	defer nc.Close()

	if _, err := nc.Subscribe(events.ClickEventsSubject, func(m *nats.Msg) {
		var event events.ClickEvent
		if err := json.Unmarshal(m.Data, &event); err != nil {
			log.Printf("decode click event: %v", err)
			return
		}
		log.Printf("analytics click tenant=%s game=%s country=%s time=%d", event.TenantID, event.GameID, event.Country, event.Time)
		// Production deployments insert this event into the ClickHouse clicks table
		// created by infra/clickhouse.sql.
	}); err != nil {
		log.Fatalf("subscribe %s: %v", events.ClickEventsSubject, err)
	}

	if err := nc.Flush(); err != nil {
		log.Fatalf("flush nats subscription: %v", err)
	}
	fmt.Printf("analytics consumer listening on %s via %s\n", events.ClickEventsSubject, natsURL)

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

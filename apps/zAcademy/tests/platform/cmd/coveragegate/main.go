package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

func main() {
	if len(os.Args) < 3 {
		fmt.Fprintln(os.Stderr, "usage: coveragegate <coverprofile> <min_percent>")
		os.Exit(2)
	}
	path := os.Args[1]
	min, err := strconv.ParseFloat(os.Args[2], 64)
	if err != nil {
		fmt.Fprintf(os.Stderr, "invalid min percent: %v\n", err)
		os.Exit(2)
	}
	f, err := os.Open(path)
	if err != nil {
		fmt.Fprintf(os.Stderr, "open profile: %v\n", err)
		os.Exit(2)
	}
	defer f.Close()

	var covered, total float64
	s := bufio.NewScanner(f)
	for s.Scan() {
		line := s.Text()
		if strings.HasPrefix(line, "mode:") { continue }
		parts := strings.Fields(line)
		if len(parts) < 3 { continue }
		n, err1 := strconv.ParseFloat(parts[1], 64)
		c, err2 := strconv.ParseFloat(parts[2], 64)
		if err1 != nil || err2 != nil { continue }
		total += n
		if c > 0 { covered += n }
	}
	if err := s.Err(); err != nil {
		fmt.Fprintf(os.Stderr, "scan profile: %v\n", err)
		os.Exit(2)
	}
	if total == 0 {
		fmt.Fprintln(os.Stderr, "no coverage data")
		os.Exit(2)
	}
	pct := (covered / total) * 100
	fmt.Printf("coverage=%.2f%% (min=%.2f%%)\n", pct, min)
	if pct < min {
		os.Exit(1)
	}
}

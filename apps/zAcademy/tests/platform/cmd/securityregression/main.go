package main

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"zacademy/tests/platform/internal/securitypolicy"
)

func main() {
	mods, err := moduleVersions()
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to load module graph: %v\n", err)
		os.Exit(2)
	}
	violations := securitypolicy.EvaluateModules(mods, securitypolicy.DefaultRuleSet())
	if len(violations) == 0 {
		fmt.Println("security regression policy check passed")
		return
	}
	for _, v := range violations {
		fmt.Fprintf(os.Stderr, "violation: %s: %s\n", v.Module, v.Reason)
	}
	os.Exit(1)
}

func moduleVersions() (map[string]string, error) {
	cmd := exec.Command("go", "list", "-m", "all")
	out, err := cmd.Output()
	if err != nil {
		return nil, err
	}
	mods := map[string]string{}
	s := bufio.NewScanner(strings.NewReader(string(out)))
	for s.Scan() {
		fields := strings.Fields(s.Text())
		if len(fields) < 2 {
			continue
		}
		mods[fields[0]] = fields[1]
	}
	if err := s.Err(); err != nil {
		return nil, err
	}
	return mods, nil
}

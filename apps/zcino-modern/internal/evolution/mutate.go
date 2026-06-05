package evolution

import (
	"bufio"
	"fmt"
	"go/parser"
	"go/token"
	"regexp"
	"strings"
)

var (
	dangerousImportPattern = regexp.MustCompile(`"(os|net/http|net|syscall|unsafe|os/exec|io/ioutil)"`)
	dangerousCallPatterns  = []*regexp.Regexp{
		regexp.MustCompile(`\bos\.(Create|OpenFile|Remove|RemoveAll|WriteFile|Mkdir|MkdirAll)\b`),
		regexp.MustCompile(`\bexec\.Command\b`),
		regexp.MustCompile(`\bhttp\.(Get|Post|Do|DefaultClient)\b`),
		regexp.MustCompile(`\bnet\.Dial\b`),
		regexp.MustCompile(`\bsyscall\.`),
		regexp.MustCompile(`\bunsafe\.`),
	}
)

type PatchGenerator interface {
	GeneratePatch(Proposal) (string, error)
}

type StaticPatchGenerator struct {
	Patch string
}

func (g StaticPatchGenerator) GeneratePatch(Proposal) (string, error) {
	if strings.TrimSpace(g.Patch) == "" {
		return "", fmt.Errorf("patch generator returned an empty patch")
	}
	return g.Patch, nil
}

func GeneratePatch(target string) string {
	target = strings.TrimSpace(target)
	if target == "" {
		target = "bounded optimization"
	}
	return fmt.Sprintf("diff --git a/internal/evolution/notes.go b/internal/evolution/notes.go\n--- a/internal/evolution/notes.go\n+++ b/internal/evolution/notes.go\n@@ -0,0 +1,3 @@\n+package evolution\n+\n+// Proposed improvement: %s\n", sanitizePatchComment(target))
}

func ValidatePatch(patch string) error {
	validator := PatchValidator{MaxBytes: 64 * 1024}
	return validator.ValidatePatch(patch)
}

type PatchValidator struct {
	MaxBytes int
}

func (v PatchValidator) ValidatePatch(patch string) error {
	if strings.TrimSpace(patch) == "" {
		return fmt.Errorf("patch is empty")
	}
	maxBytes := v.MaxBytes
	if maxBytes <= 0 {
		maxBytes = 64 * 1024
	}
	if len(patch) > maxBytes {
		return fmt.Errorf("patch exceeds %d bytes", maxBytes)
	}
	if !strings.Contains(patch, "diff --git ") || strings.Contains(patch, "GIT binary patch") {
		return fmt.Errorf("patch must be a textual unified git diff")
	}

	addedGoByFile := map[string][]string{}
	currentFile := ""
	scanner := bufio.NewScanner(strings.NewReader(patch))
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "diff --git ") {
			fields := strings.Fields(line)
			if len(fields) >= 4 {
				currentFile = strings.TrimPrefix(fields[3], "b/")
			}
			continue
		}
		if !strings.HasPrefix(line, "+") || strings.HasPrefix(line, "+++") {
			continue
		}
		added := strings.TrimPrefix(line, "+")
		if dangerousImportPattern.MatchString(added) {
			return fmt.Errorf("patch adds a dangerous import: %s", strings.TrimSpace(added))
		}
		for _, pattern := range dangerousCallPatterns {
			if pattern.MatchString(added) {
				return fmt.Errorf("patch adds a forbidden operation: %s", strings.TrimSpace(added))
			}
		}
		if strings.HasSuffix(currentFile, ".go") {
			addedGoByFile[currentFile] = append(addedGoByFile[currentFile], added)
		}
	}
	if err := scanner.Err(); err != nil {
		return fmt.Errorf("scan patch: %w", err)
	}
	for file, lines := range addedGoByFile {
		if err := parseAddedGo(file, lines); err != nil {
			return err
		}
	}
	return nil
}

func parseAddedGo(file string, lines []string) error {
	joined := strings.TrimSpace(strings.Join(lines, "\n"))
	if joined == "" || !strings.Contains(joined, "package ") {
		return nil
	}
	if _, err := parser.ParseFile(token.NewFileSet(), file, strings.Join(lines, "\n"), parser.ImportsOnly); err != nil {
		return fmt.Errorf("go AST validation failed for %s: %w", file, err)
	}
	return nil
}

func sanitizePatchComment(value string) string {
	value = strings.ReplaceAll(value, "\n", " ")
	value = strings.ReplaceAll(value, "\r", " ")
	return strings.TrimSpace(value)
}

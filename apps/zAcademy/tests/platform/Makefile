.PHONY: deps test-unit test-integration test-contract test-chaos coverage load sbom vuln-gate verify-artifacts supply-chain security-regression drift-guard

deps:
	go mod tidy

test-unit:
	go test ./unit ./internal/... -coverprofile=coverage.out -covermode=count
	go run ./cmd/coveragegate coverage.out 85

test-integration:
	go test -tags=integration ./integration -v

test-contract:
	go test ./contract -v

test-chaos:
	go test ./chaos -v

coverage: test-unit

load:
	k6 run ./load/payment_load.js

sbom:
	./scripts/generate_sbom.sh

vuln-gate:
	./scripts/vuln_gate.sh

verify-artifacts:
	./scripts/verify_artifacts.sh

supply-chain: sbom vuln-gate verify-artifacts

security-regression:
	./scripts/security_regression_gate.sh

drift-guard:
	./scripts/dependency_drift_guard.sh

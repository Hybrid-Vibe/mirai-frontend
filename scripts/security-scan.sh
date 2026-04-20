#!/usr/bin/env bash
set -euo pipefail

echo "[security] Starting repository secret scan..."

action_run_gitleaks() {
  echo "[security] Tool selected: gitleaks"
  gitleaks detect \
    --source . \
    --no-git \
    --redact \
    --exit-code 1 \
    --config .gitleaks.toml
}

action_run_trufflehog() {
  echo "[security] Tool selected: trufflehog"
  trufflehog filesystem . --fail --exclude-paths .trufflehogignore
}

if command -v gitleaks >/dev/null 2>&1; then
  action_run_gitleaks
elif command -v trufflehog >/dev/null 2>&1; then
  action_run_trufflehog
else
  echo "[security] No scanner found. Install one of: gitleaks or trufflehog."
  echo "[security] Examples:"
  echo "  brew install gitleaks"
  echo "  brew install trufflesecurity/trufflehog/trufflehog"
  exit 1
fi

echo "[security] Secret scan passed."

#!/usr/bin/env bash
# Imports every workflow JSON file in Automation/workflows/ into this machine's
# n8n instance. Run this after a fresh `docker compose up n8n` on a new
# machine (or after `docker compose down -v n8n` locally) to restore workflows
# that were committed to git - see Automation/README.md.
set -euo pipefail

cd "$(dirname "$0")/../.."

docker compose exec n8n n8n import:workflow --separate --input=/home/node/n8n-workflows

echo "Imported. Open http://localhost:5678 to verify."

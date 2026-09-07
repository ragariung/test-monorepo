#!/usr/bin/env bash
# Exports every n8n workflow as a separate JSON file into Automation/workflows/,
# via the bind mount configured in docker-compose.yml's n8n service. This is
# how workflow changes become git-trackable - see Automation/README.md.
set -euo pipefail

cd "$(dirname "$0")/../.."

docker compose exec n8n n8n export:workflow --all --separate --output=/home/node/n8n-workflows

echo "Exported. Review with: git status Automation/workflows/"

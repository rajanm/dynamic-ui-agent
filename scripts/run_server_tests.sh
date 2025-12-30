#!/bin/bash
# Ensure we are in the project root
cd "$(dirname "$0")/.."

# Export API Key (Extracted from environment)
# Load API Key from .env if present
if [ -f .env ]; then
  source .env
fi
export COVERAGE_FILE=log/.coverage

echo "Running tests..."
# Run pytest with coverage for servers and agent_app
.venv/bin/pytest --cov=servers --cov=agent_app --cov-report=term-missing --cov-report=html:log/htmlcov | tee log/tests.log

#!/bin/bash
cd "$(dirname "$0")/.."

# Export API Key (Extracted from environment)
# Load API Key from .env if present
if [ -f .env ]; then
  source .env
fi

cleanup() {
    echo "Stopping services..."
    kill -INT $SERVER_PID $API_SERVER_PID $UI_PID 2>/dev/null
}
trap cleanup EXIT INT TERM

mkdir -p log
export COVERAGE_FILE=log/.coverage

# Default Ports if not set
PORT=${PORT:-8000}
MOCK_API_PORT=${MOCK_API_PORT:-9999}
UI_PORT=${UI_PORT:-4200}

echo "Starting Mock API Server..."
.venv/bin/python -m coverage run -p --source=servers,agent_app -m servers.mock_api_server > log/mock_api_server_test.log 2>&1 &
SERVER_PID=$!

echo "Starting Agent API Server..."
export API_BASE_URL="http://127.0.0.1:$MOCK_API_PORT"
.venv/bin/python -m coverage run -p --source=servers,agent_app -m servers.agent_server > log/agent_server_test.log 2>&1 &
API_SERVER_PID=$!

echo "Starting Angular UI..."
cd web
npx ng serve --port $UI_PORT --host 0.0.0.0 > ../log/ui_test.log 2>&1 &
UI_PID=$!
cd ..

echo "Waiting for services to be ready..."

# Function to wait for a URL
wait_for_url() {
    local url=$1
    local name=$2
    echo "Waiting for $name at $url..."
    for i in {1..60}; do
        if curl -s "$url" > /dev/null; then
            echo "$name is up!"
            return 0
        fi
        sleep 1
    done
    echo "Timed out waiting for $name"
    return 1
}

# Wait for all services
# Mock API is $MOCK_API_PORT, Agent Server is $PORT, UI is $UI_PORT
wait_for_url "http://localhost:$MOCK_API_PORT/docs" "Mock API" || exit 1
wait_for_url "http://localhost:$PORT/health" "Agent Server" || exit 1
wait_for_url "http://localhost:$UI_PORT" "Angular UI" || exit 1

echo "Waiting for UI to stabilize..."
sleep 5


echo "All services ready. Running Playwright Tests..."
cd ui-tests
npx playwright test "$@" > ../log/test_run.log 2>&1
EXIT_CODE=$?
cd ..
cat log/test_run.log

if [ $EXIT_CODE -eq 0 ]; then
    echo "UI Tests Passed!"
else
    echo "UI Tests Failed!"
fi


echo "Stopping services to flush coverage data..."
kill -INT $SERVER_PID $API_SERVER_PID 2>/dev/null
wait $SERVER_PID $API_SERVER_PID 2>/dev/null
sleep 2 # Extra buffer just in case

echo "Generating Coverage Report..."
.venv/bin/python -m coverage combine
.venv/bin/python -m coverage report
.venv/bin/python -m coverage html -d log/ui_htmlcov

# Cleanup combined coverage file if only HTML is needed
# rm "$COVERAGE_FILE" 

exit $EXIT_CODE

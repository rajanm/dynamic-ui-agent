#!/bin/bash


# Ensure we are in the project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# Export API Key (Extracted from environment)
# Load API Key from .env if present
if [ -f .env ]; then
  source .env
fi

cleanup() {
    echo "Stopping all services..."
    kill $SERVER_PID
    kill $API_SERVER_PID
    kill $UI_PID
    exit
}

# Trap SIGINT (Ctrl+C) to run cleanup
trap cleanup SIGINT

# Function to kill process on a port
kill_port() {
    PORT=$1
    PID=$(lsof -t -i:$PORT)
    if [ -n "$PID" ]; then
        echo "Killing process $PID on port $PORT"
        kill -9 $PID
    fi
}

# Cleanup existing ports
echo "Checking for existing processes on ports 9999 and 8000..."
kill_port 9999
kill_port 8000


# Start the Mock API Server in the background
echo "Starting Mock API Server..."
.venv/bin/python -m servers.mock_api_server > log/mock_api_server.log 2>&1 &
SERVER_PID=$!

# Wait for the server to start
echo "Waiting for Mock API Server to start..."
sleep 2
if curl -s http://localhost:9999/search > /dev/null; then
    echo "Mock API Server is running on port 9999."
else
    echo "Error: Mock API Server failed to start on port 9999."
    exit 1
fi

# Start the Agent API Server
echo "Starting Agent API Server..."
echo "This invokes the ADK agent and logs from both agent server and adk agent are captured below"
# adk web  <-- Commented out as requested
# adk api_server & <-- Replaced by custom server
.venv/bin/python -m servers.agent_server > log/agent_server.log 2>&1 &
API_SERVER_PID=$!

echo "Waiting for Agent API Server to start..."
sleep 5
if curl -s http://localhost:8000/health > /dev/null; then
    echo "Agent API Server is running on port 8000."
else
    echo "Error: Agent API Server failed to start on port 8000."
    exit 1
fi

# Start the Angular UI
echo "Starting Angular UI..."
cd web
npx ng serve &
UI_PID=$!

# Wait for processes
wait

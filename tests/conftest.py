import sys
import os
import pytest
import threading
import uvicorn
import time

# Add the project root to sys.path so that 'servers' and 'agent_app' can be imported
# Since this file is in tests/, we need to go up one level to reach the root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from servers.mock_api_server import app as mock_api_app

@pytest.fixture(scope="session")
def mock_api_server():
    """Starts the Mock API Server in a background thread."""
    port = 9998
    
    def run_server():
        uvicorn.run(mock_api_app, host="127.0.0.1", port=port, log_level="error")
    
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Wait for server to start
    time.sleep(2) 
    
    yield f"http://127.0.0.1:{port}"

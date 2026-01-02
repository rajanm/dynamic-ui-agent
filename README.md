# Vehicle Shopping Agent

A comprehensive conversational AI system designed to assist users with vehicle-related tasks including searching, comparing, booking, and analyzing market trends. Built using Google's GenAI ADK, FastAPI, and Angular.

## Project Overview

The Vehicle Agent orchestrates multiple specialized sub-agents to handle specific user intents:

- **Product Search Agent**: Finds vehicles based on criteria (make, model, type).
- **Product Compare Agent**: Compares specifications of two vehicles.
- **Product Book Agent**: Schedules test drives or inspections.
- **Product Negotiate Agent**: Handles price negotiation logic.
- **Market Trend Agent**: Provides insights on current market trends (e.g., EVs in Singapore).

## Key Features

- **Rich UI Rendering (A2UI)**: Dynamic generation of Tables, Comparison Cards, and Booking Forms driven by backend payloads.
- **Dual UI Modes**:
  - **Conversational UI**: Clean, text-based chat interface.
  - **Generative UI**: Visual, interactive component rendering.
- **Robust Validation**: Server-side Schema Validation ensures only valid A2UI payloads reach the frontend.

The system features a **Dynamic UI** built with Angular that supports rich interactions and a **Python Backend** powering the agent logic.

## Prerequisites

- **Python**: `>=3.13`
- **Node.js**: `v20+` (Recommended) / `npm` `v10+`
- **uv**: Required for Python dependency management. [Install uv](https://github.com/astral-sh/uv).
- **Google Cloud Project & API Key**: Required for Gemini models.

## Quick Start

1.  **Install Dependencies**

    ```bash
    # Install Python dependencies (creates .venv)
    uv sync

    # Install Frontend dependencies
    cd web
    npm install
    cd ..
    ```

2.  **Configure Environment**
    Create a `.env` file in the root directory to configure the services. This is required for custom configurations.

    ```ini
    # Core Configuration
    GOOGLE_API_KEY="your_api_key_here"
    
    # Server Ports & URLs
    PORT=8000
    MOCK_API_PORT=9999
    MOCK_API_URL="http://localhost:9999"
    UI_PORT=4200
    
    # Security
    ALLOWED_ORIGINS="http://localhost:4200,http://localhost:3000,http://127.0.0.1:4200"
    ```

3.  **Run the Application**
    Use the all-in-one demo script to start the Mock API, Agent Server, and Angular UI:
    ```bash
    ./scripts/run_demo.sh
    ```
    - **UI**: [http://localhost:4200](http://localhost:4200)
    - **Agent Server Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
    - **Mock API Docs**: [http://localhost:9999/docs](http://localhost:9999/docs)

## Testing

### Unit & Integration Tests (Backend)

Runs `pytest` with coverage for the `servers` and `agent_app` modules.

```bash
./scripts/run_server_tests.sh
```

**Code Coverage**:

- **Console Report**: Displayed after tests.
- **HTML Report**: `log/htmlcov/index.html`.
- **Trace File**: `log/.coverage` (Consolidated).

### UI / E2E Tests (Frontend)

Runs **Playwright** tests to verify the full chat flow, agent capabilities, and UI responsiveness.

```bash
./scripts/run_ui_tests.sh
```

- **Note**: This script automatically starts all necessary services before running tests.

## Architecture

The system follows a modular client-server architecture:

![System Architecture](docs/architecture_diagram.png)

### Frontend (Angular)

- **Location**: `web/`
- **Tech Stack**: Angular 21+ (Standalone Components), Signals, RxJS.
- **Role**: Handles user input, displays streaming agent responses, and manages UI state (loading, focus).
- **Communication**: Sends HTTP POST requests to the Agent Server (`/chat`).
- **A2UI Surfaces**:
  - `table`: Grid view for vehicle search results.
  - `card-comparison`: Side-by-side spec comparison.
  - `booking-form`: Context-aware form for scheduling.
  - **Event Handling**: Client events (e.g., `rowSelect`) are sent back to the agent for context-aware follow-ups.

### Backend (Python)

- **Location**: `servers/`, `agent_app/`
- **Tech Stack**: FastAPI, Google GenAI ADK, Uvicorn.
- **Components**:
  - **Agent Server** (`servers/agent_server.py`): The main entry point. Initializes the `RootAgent` and exposes it via REST API.
    - **Safety Gate**: Validates all A2UI messages against a strict JSON schema before sending.
  - **Agent Logic** (`agent_app/agent.py`): Defines the `LlmAgent`, tools, and sub-agent hierarchy.
  - **Mock API Server** (`servers/mock_api_server.py`): Simulates an external vehicle inventory and booking system. Serves data from `data/*.json`.

### Directory Structure

```
.
├── agent_app/       # Agent logic and definitions
├── data/            # Mock data for the API server
├── scripts/         # Helper shell scripts (run, test, lint)
├── servers/         # FastAPI server implementations
├── ui-tests/        # Playwright E2E tests
├── web/             # Angular Frontend application
├── pyproject.toml   # Python dependencies (uv)
└── uv.lock          # Locked dependencies
```

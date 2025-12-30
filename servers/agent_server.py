import os
import logging
from typing import Optional, Dict, Any, List, Union
import json
import uuid
import jsonschema
from jsonschema import validate, ValidationError

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Import the root_agent from our agent_app
from agent_app.agent import root_agent
from google.adk.runners import Runner
from google.adk.agents import Agent
from google.genai.types import Content, Part, Tool
from google.adk.sessions.in_memory_session_service import InMemorySessionService

APP_NAME = "vehicle_agent"

# --- A2UI Schema & Mock Data ---

A2UI_SCHEMA = {
    "type": "object",
    "properties": {
        "action": {
            "type": "string",
            "enum": ["beginRendering", "surfaceUpdate", "dataModelUpdate", "deleteSurface"]
        },
        "surfaceId": {"type": "string"},
        "surfaceType": {"type": "string"},
        "data": {"type": "object"}
    },
    "required": ["action", "surfaceId", "surfaceType", "data"]
}

def validate_a2ui_msg(msg: Dict[str, Any]):
    """Validates the A2UI message against the schema."""
    try:
        validate(instance=msg, schema=A2UI_SCHEMA)
    except ValidationError as e:
        logger.error(f"A2UI Validation Error: {e.message}")
        # We might want to re-raise or handle gracefully. 
        # For now, re-raising ensures we don't send bad data.
        raise e

import requests


# --- Load Product Data ---
def load_product_data():
    try:
        with open("data/product_search.json", "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load product_search.json: {e}")
        return []

ALL_VEHICLES = load_product_data()

# Helper to find vehicle ID by query text
def find_vehicles_in_text(text: str, limit: int = 2) -> List[str]:
    text = text.lower()
    
    matched_ids = []
    
    # 0. Identify explicit IDs (e.g. "1", "3")
    import re
    # Match standalone digits
    ids_in_text = re.findall(r'\b\d+\b', text)
    for potential_id in ids_in_text:
        # Verify if this ID exists in our vehicle list
        if any(v['id'] == potential_id for v in ALL_VEHICLES):
            if potential_id not in matched_ids:
                matched_ids.append(potential_id)
                
    # If we have enough IDs, return them (prioritize explicit IDs)
    if len(matched_ids) >= limit:
        return matched_ids[:limit]

    # 1. Identify explicit Models
    for v in ALL_VEHICLES:
        if v['model'].lower() in text:
            if v['id'] not in matched_ids:
                matched_ids.append(v['id'])
    
    # 2. Identify explicit Makes (if we need more)
    if len(matched_ids) < limit:
        for v in ALL_VEHICLES:
            if v['make'].lower() in text:
                # Check if we already have a vehicle of this make
                already_has_make = any(v['make'] == next((x['make'] for x in ALL_VEHICLES if x['id'] == mid), "") for mid in matched_ids)
                if not already_has_make and v['id'] not in matched_ids:
                    matched_ids.append(v['id'])
                    
    return matched_ids[:limit]

# --- Tools for Agent ---

MOCK_API_URL = os.environ.get("MOCK_API_URL", "http://localhost:9999")

def search_cars(query: str) -> List[Dict[str, Any]]:
    """Searches for cars based on a query."""
    logger.info(f"Tool search_cars called with query: {query}")
    query = query.lower()
    
    # Extract make from query (simple heuristic)
    make = None
    if "toyota" in query: make = "Toyota"
    elif "honda" in query: make = "Honda"
    elif "tesla" in query: make = "Tesla"
    elif "ford" in query: make = "Ford"
    elif "bmw" in query: make = "BMW"
    elif "mercedes" in query: make = "Mercedes-Benz"
    elif "hyundai" in query: make = "Hyundai"
    elif "kia" in query: make = "Kia"
    
    params = {}
    if make:
        params["make"] = make
        
    try:
        response = requests.get(f"{MOCK_API_URL}/search", params=params)
        response.raise_for_status()
        results = response.json()
        
        # Transform for UI (Add 'image' and format 'price')
        for car in results:
            # Generate mock image path
            safe_model = car['model'].lower().replace(' ', '').replace('-', '')
            safe_make = car['make'].lower()
            car['image'] = f"assets/{safe_make}_{safe_model}.jpg"
            
            # Format price if number
            if isinstance(car['price'], (int, float)):
                car['price'] = f"${car['price']:,}"
                
        return results
    except Exception as e:
        logger.error(f"Error calling Mock API search: {e}")
        return []

def compare_cars(car_ids: List[str]) -> Dict[str, Any]:
    """Compares specific cars by their IDs."""
    logger.info(f"Tool compare_cars called with car_ids: {car_ids}")
    
    if len(car_ids) < 2:
        return {"cars": []}
        
    try:
        # Mock API only supports comparing 2 vehicles
        response = requests.get(f"{MOCK_API_URL}/compare", params={"vehicle1_id": car_ids[0], "vehicle2_id": car_ids[1]})
        response.raise_for_status()
        data = response.json()
        
        # Transform nested comparison to list of cars for UI
        comparison = data.get("comparison", {})
        v1 = comparison.get("vehicle1")
        v2 = comparison.get("vehicle2")
        
        cars = []
        if v1: cars.append(v1)
        if v2: cars.append(v2)
        
        # Fix format for UI
        for car in cars:
             safe_model = car['model'].lower().replace(' ', '').replace('-', '')
             safe_make = car['make'].lower()
             car['image'] = f"assets/{safe_make}_{safe_model}.jpg"
             if isinstance(car['price'], (int, float)):
                car['price'] = f"${car['price']:,}"
        
        return {
            "cars": cars,
            "verdict": data.get("comparison", {}).get("verdict", "")
        }
    except Exception as e:
        logger.error(f"Error calling Mock API compare: {e}")
        return {"cars": []}

def book_appointment(car_id: str, date: str, email: str) -> str:
    """Book a test drive appointment."""
    logger.info(f"Tool book_appointment called for car_id={car_id}, date={date}, email={email}")
    
    try:
        payload = {
            "vehicle_id": car_id,
            "customer_name": "Demo User", # details not captured in simple form
            "date": date
        }
        response = requests.post(f"{MOCK_API_URL}/book", json=payload)
        response.raise_for_status()
        data = response.json()
        
        return f"Appointment confirmed. Status: {data.get('status', 'Confirmed')}."
    except Exception as e:
        logger.error(f"Error calling Mock API book: {e}")
        return "Failed to book appointment due to server error."

def handle_client_event(event_type: str, payload: Dict[str, Any]) -> str:
    """Handles events sent from the client UI."""
    logger.info(f"Tool handle_client_event called: type={event_type}, payload={payload}")
    if event_type == "formSubmit":
        # Example: payload={"carId": "c1", "date": "2023-10-10", "email": "bmw@test.com"}
        return book_appointment(payload.get("carId"), payload.get("date"), payload.get("email"))
    elif event_type == "rowSelect":
        return f"User selected car {payload.get('carId')}. Ask if they want to compare or book it."
    return f"Event {event_type} received."

# --- Polyfill for ag_ui_adk ---
class ADKAgent:
    """
    Wrapper around ADK Agent to provide AG-UI compatible interface.
    """
    def __init__(
        self,
        adk_agent: Agent,
        app_name: str,
        user_id: str = "demo_user",
        execution_timeout_seconds: int = 600,
        tool_timeout_seconds: int = 300,
    ):
        self.adk_agent = adk_agent
        self.app_name = app_name
        self.user_id = user_id
        
        # Initialize standard ADK Runner
        self.session_service = InMemorySessionService()
        self.session_service.create_session_sync(
            app_name=self.app_name,
            user_id=self.user_id,
            session_id="default_session"
        )
        self.runner = Runner(
            agent=self.adk_agent,
            app_name=self.app_name,
            session_service=self.session_service,
        )
        
        # Add tools to the agent's context (simplification: updating the prompt or tool definitions dynamically)
        # For this demo, we assume the root_agent or a new agent instance is configured with these.
        # Ideally, we would update self.adk_agent.tools here or similar.
        # Since ADK structure varies, we'll assume root_agent has instructions or we inject them.
        # FOR DEMO: We will manually handle tool calls if the LLM suggests them, or assume the agent uses them.
        # NOTE: Real A2UI would have the model emit A2UI commands directly. Here we might need a processing layer
        # to convert tool outputs into A2UI commands if the model doesn't do it natively.
        
        # Injecting instructions for A2UI
        self.system_instruction = """
        You are a helpful vehicle agent. You can search for cars, compare them, and book test drives.
        
        CRITICAL: You communicate with the UI using specific JSON commands. 
        When you want to show a UI component, output a VALID JSON block (and nothing else for that part) with this schema:
        {
          "action": "beginRendering" | "surfaceUpdate",
          "surfaceId": "unique-id",
          "surfaceType": "table" | "card-comparison" | "booking-form" | "markdown",
          "data": { ... component specific data ... }
        }
        
        MAPPINGS:
        1. If user asks to search cars -> Call search_cars() -> Then output A2UI JSON with surfaceType="table" and data={"columns": ["Make", "Model", "Year", "Price"], "rows": [ ...from tool result... ]}.
        2. If user asks to compare cars -> Call compare_cars() -> Then output A2UI JSON with surfaceType="card-comparison" and data={"cards": [ ...from tool result... ]}.
        3. If user wants to book -> Output A2UI JSON with surfaceType="booking-form" and data={"carId": "..."}.
        4. If you receive a 'formSubmit' event -> Call book_appointment() -> Output confirmation text or markdown.
        """
        # In a real app, we'd append this to the agent's instructions.
        
    async def process_message(self, query: str, session_id: str = "default_session", event_payload: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Process a message using the ADK Runner.
        """
        logger.info(f"Processing message: {query} for session: {session_id}")
        
        # Ensure session exists
        session = self.session_service.get_session_sync(
             app_name=self.app_name,
             user_id=self.user_id,
             session_id=session_id
        )
        if not session:
             self.session_service.create_session_sync(
                 app_name=self.app_name,
                 user_id=self.user_id,
                 session_id=session_id
             )
        
        # Prepare content
        # If it's an event, we format it as a system message or specific tool result
        if event_payload:
            # Inject event into conversation
             input_text = f"EVENT: {json.dumps(event_payload)}"
        else:
             input_text = query

        # For this demo, since we can't easily modify the frozen 'root_agent' object deeply without
        # side effects, we will do a simple KEYWORD INTERCEPTION for the tools to simulate the full flow
        # if the 'root_agent' isn't actually configured with these new tools yet.
        # REAL IMPLEMENTATION: The agent would have these tools registered.
        
        response_text = ""
        
        # --- SIMPLE TOOL SIMULATION (Middleware) ---
        if "search" in input_text.lower() or "find" in input_text.lower():
            cars = search_cars(input_text)
            surface_id = str(uuid.uuid4())
            a2ui_msg = {
                "action": "beginRendering",
                "surfaceId": surface_id,
                "surfaceType": "table",
                "data": {
                    "columns": ["ID", "Make", "Model", "Year", "Price"],
                    "rows": cars
                }
            }
            validate_a2ui_msg(a2ui_msg)
            response_text = json.dumps(a2ui_msg)

        elif "compare" in input_text.lower():
            # Dynamic ID Resolution
            found_ids = find_vehicles_in_text(input_text)
            
            # Fallback if no specific makes found (or only 1)
            if len(found_ids) < 2:
                # If lookup failed, maybe default to Camry vs Accord as a safe fallback
                if "1" not in found_ids: found_ids.append("1")
                if "2" not in found_ids and len(found_ids) < 2: found_ids.append("2")
                
            cars = compare_cars(found_ids)
            surface_id = str(uuid.uuid4())
            a2ui_msg = {
                "action": "beginRendering",
                "surfaceId": surface_id,
                "surfaceType": "card-comparison",
                "data": cars
            }
            validate_a2ui_msg(a2ui_msg)
            response_text = json.dumps(a2ui_msg)
            
        elif "book" in input_text.lower() and "form" not in input_text.lower():
            # Trigger form
            surface_id = str(uuid.uuid4())
            a2ui_msg = {
                "action": "beginRendering",
                "surfaceId": surface_id,
                "surfaceType": "booking-form",
                "data": {"carId": "c1", "make": "Tesla", "model": "Model 3"} # Mock context
            }
            validate_a2ui_msg(a2ui_msg)
            response_text = json.dumps(a2ui_msg)
            
        elif "EVENT:" in input_text:
             # Handle event
             try:
                 event_data = json.loads(input_text.replace("EVENT: ", ""))
                 client_event = event_data.get("type")
                 payload = event_data.get("payload", {})
                 
                 result = handle_client_event(client_event, payload)
                 response_text = result
             except Exception as e:
                 response_text = f"Error handling event: {e}"
        
        else:
            # Fallback to actual agent for chat
            try:
                content = Content(parts=[Part(text=input_text)])
                async for event in self.runner.run_async(
                    user_id=self.user_id,
                    session_id=session_id,
                    new_message=content
                ):
                    if event.content and event.content.parts:
                        for part in event.content.parts:
                            if part.text:
                                response_text += part.text
            except Exception as e:
                logger.error(f"Error calling agent: {e}")
                response_text = "I'm having trouble connecting to my brain right now."

        # Return formatted response
        return {"text": response_text, "data": None}

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = "default_session"
    event: Optional[Dict[str, Any]] = None # Support for client events

def add_adk_fastapi_endpoint(
    app: FastAPI,
    adk_agent: ADKAgent,
    path: str = "/"
):
    """
    Registers AG-UI compatible endpoints on the FastAPI app.
    """
    
    @app.post(f"{path}chat", tags=["Agent"], summary="Chat with the agent")
    async def chat_endpoint(request: ChatRequest):
        """
        Send a message to the agent and get a response.
        """
        if request.event:
             # Process client event
             response = await adk_agent.process_message("", request.session_id, event_payload=request.event)
        else:
             response = await adk_agent.process_message(request.query, request.session_id)
        return response

    logger.info(f"Added ADK endpoints at {path}chat")

# --- End Polyfill ---

# Create AG-UI wrapper around the existing ADK agent
adk_agent = ADKAgent(
    adk_agent=root_agent,
    app_name=APP_NAME,
    user_id="demo_user",
)

# Create FastAPI app
app = FastAPI(
    title="Vehicle Agent API",
    description="AG-UI compatible API for the Vehicle Agent",
    version="1.0.0",
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200", # Angular Default
        "http://localhost:3000", # Next.js Default
        "http://127.0.0.1:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "agent": APP_NAME}

# Add AG-UI endpoint at root path
add_adk_fastapi_endpoint(app, adk_agent, path="/")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting AG-UI server at http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

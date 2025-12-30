import os
import logging
from typing import List, Dict, Any, Optional

from google.adk.agents.llm_agent import LlmAgent
from google.adk.tools import FunctionTool, google_search
from google.adk.tools.agent_tool import AgentTool

import httpx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
MODEL_NAME = "gemini-2.5-pro"
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:9999")

# --- Tools ---

async def search_vehicles_tool(make: Optional[str] = None, model: Optional[str] = None, type: Optional[str] = None) -> List[Dict[str, Any]]:
    """Searches for vehicles based on make, model, or type."""
    params = {}
    if make: params['make'] = make
    if model: params['model'] = model
    if type: params['type'] = type
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/search", params=params)
        response.raise_for_status()
        return response.json()

async def compare_vehicles_tool(vehicle1_id: str, vehicle2_id: str) -> Dict[str, Any]:
    """Compares two vehicles given their IDs."""
    params = {'vehicle1_id': vehicle1_id, 'vehicle2_id': vehicle2_id}
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/compare", params=params)
        response.raise_for_status()
        return response.json()

async def book_vehicle_tool(vehicle_id: str, customer_name: str, date: str) -> Dict[str, Any]:
    """Books a vehicle for inspection."""
    payload = {'vehicle_id': vehicle_id, 'customer_name': customer_name, 'date': date}
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{API_BASE_URL}/book", json=payload)
        response.raise_for_status()
        return response.json()

async def negotiate_price_tool(vehicle_id: str, offer_price: float) -> Dict[str, Any]:
    """Negotiates the price of a vehicle."""
    payload = {'vehicle_id': vehicle_id, 'offer_price': offer_price}
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{API_BASE_URL}/negotiate", json=payload)
        response.raise_for_status()
        return response.json()

# --- Agents ---

# 1. Product Search Agent
search_agent = LlmAgent(
    name="ProductSearchAgent",
    model=MODEL_NAME,
    instruction="You are a vehicle search specialist. Use the search_vehicles_tool to find vehicles that match the user's criteria.",
    tools=[FunctionTool(search_vehicles_tool)]
)

# 2. Product Compare Agent
compare_agent = LlmAgent(
    name="ProductCompareAgent",
    model=MODEL_NAME,
    description="You are a vehicle comparison specialist. Use the compare_vehicles_tool to compare two vehicles.",
    instruction="You are a vehicle comparison specialist. Use the compare_vehicles_tool to compare two vehicles.",
    tools=[FunctionTool(compare_vehicles_tool)]
)

# 3. Product Book Agent
book_agent = LlmAgent(
    name="ProductBookAgent",
    model=MODEL_NAME,
    description="You are a booking specialist. Use the book_vehicle_tool to book a vehicle for inspection.",
    instruction="You are a booking specialist. Use the book_vehicle_tool to book a vehicle for inspection.",
    tools=[FunctionTool(book_vehicle_tool)]
)

# 4. Product Negotiate Agent
negotiate_agent = LlmAgent(
    name="ProductNegotiateAgent",
    model=MODEL_NAME,
    description="You are a negotiation specialist. Use the negotiate_price_tool to negotiate the price of a vehicle.",
    instruction="You are a negotiation specialist. Use the negotiate_price_tool to negotiate the price of a vehicle.",
    tools=[FunctionTool(negotiate_price_tool)]
)

# 5. Market Trend Agent
market_trend_agent = LlmAgent(
    name="MarketTrendAgent",
    model=MODEL_NAME,
    description="You are a market trend analyst. Use the mock_market_research tool to find information about current market trends.",
    instruction="You are a market trend analyst. Use the mock_market_research tool to find information about current market trends.",
    tools=[google_search]
)

# 6. Intent Agent (Router)
# We can use a router agent or just let the Root Agent decide. 
# The prompt asks for an "Intent Agent". Let's make it an LlmAgent that routes or classifies.
# However, ADK's LlmAgent with sub_agents can act as a router.
# Let's define the Intent Agent as one that understands what the user wants and delegates.

intent_agent = LlmAgent(
    name="IntentAgent",
    model=MODEL_NAME,
    instruction="""You are an intent classifier. Analyze the user's request and determine which specialist agent should handle it.
    - If the user wants to find cars, delegate to ProductSearchAgent.
    - If the user wants to compare cars, delegate to ProductCompareAgent.
    - If the user wants to book a test drive or inspection, delegate to ProductBookAgent.
    - If the user wants to negotiate price, delegate to ProductNegotiateAgent.
    - If the user wants to know about popular cars or market trends or is unsure about what car to buy, you MUST call the MarketTrendAgent tool. Do NOT answer with general knowledge.
    
    Examples:
    User: "What are the latest market trends?"
    Action: Delegate to MarketTrendAgent.
    """,
    sub_agents=[search_agent, compare_agent, book_agent, negotiate_agent],
    tools=[AgentTool(market_trend_agent)]
)

# 6. Root Agent
root_agent = LlmAgent(
    name="RootAgent",
    model=MODEL_NAME,
    instruction="You are the main interface for the Vehicle Agent System. You help users with car related queries and tasks by delegating to the IntentAgent. If the user greets you, greet them back and ask how you can help. If the user asks a specific question or request, delegate immediately to the IntentAgent.",
    sub_agents=[intent_agent]
)

if __name__ == "__main__":
    # This block is for testing via command line if needed, 
    # but the plan says to use `adk web` which might expect a different setup or just the agent object.
    # Usually `adk web` points to a python file and an agent object.
    # Example: adk web agents.py:root_agent
    pass

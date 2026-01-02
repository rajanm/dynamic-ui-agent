import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

# Load environment variables
load_dotenv()

app = FastAPI()

# Load data
def load_json(filename):
    with open(f"data/{filename}", 'r') as f:
        return json.load(f)

@app.get("/search")
async def search_vehicles(make: Optional[str] = None, model: Optional[str] = None, type: Optional[str] = None):
    data = load_json('product_search.json')
    results = data
    if make:
        results = [v for v in results if v['make'].lower() == make.lower()]
    if model:
        results = [v for v in results if v['model'].lower() == model.lower()]
    if type:
        results = [v for v in results if v.get('type', '').lower() == type.lower()]
    return results

@app.get("/compare")
async def compare_vehicles(vehicle1_id: str, vehicle2_id: str):
    data = load_json('product_search.json')
    v1 = next((v for v in data if v['id'] == vehicle1_id), None)
    v2 = next((v for v in data if v['id'] == vehicle2_id), None)
    
    comparison = {}
    if v1:
        comparison['vehicle1'] = v1
    if v2:
        comparison['vehicle2'] = v2
        
    verdict = "Comparison not available."
    if v1 and v2:
        verdict = f"Comparing {v1['make']} {v1['model']} vs {v2['make']} {v2['model']}. {v1['make']} is known for {v1['features'][0].lower()}, while {v2['make']} offers {v2['features'][0].lower()}."
        
    return {
        "comparison": {
            "vehicle1": v1,
            "vehicle2": v2,
            "verdict": verdict
        }
    }

class BookingRequest(BaseModel):
    vehicle_id: str
    customer_name: str
    date: str

@app.post("/book")
async def book_vehicle(booking: BookingRequest):
    data = load_json('product_book.json')
    # Mocking a successful booking for any request
    data['booking_details'] = booking.dict()
    return data

class NegotiationRequest(BaseModel):
    vehicle_id: str
    offer_price: float

@app.post("/negotiate")
async def negotiate_price(negotiation: NegotiationRequest):
    data = load_json('product_negotiate.json')
    # Mock logic: if offer is > 90% of price, accept (simplified for mock)
    # For now, just return the static success response
    return data

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("MOCK_API_PORT", 9999))
    uvicorn.run(app, host="0.0.0.0", port=port)


import pytest
from httpx import AsyncClient, ASGITransport
from servers.mock_api_server import app

@pytest.mark.asyncio
async def test_search_vehicles():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/search")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_search_vehicles_with_params():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/search", params={"make": "TestMake"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

    # Test other params to cover lines 20 and 22 in mock_api_server.py
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/search", params={"model": "TestModel"})
    assert response.status_code == 200

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/search", params={"type": "SUV"})
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_compare_vehicles():
    # Helper to check a vehicle object has expected fields
    def check_vehicle(v, expected_id, expected_make):
        assert v['id'] == expected_id
        assert v['make'] == expected_make
        assert 'features' in v

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Using IDs "1" (Toyota Camry) and "2" (Honda Accord) from product_search.json
        response = await ac.get("/compare", params={"vehicle1_id": "1", "vehicle2_id": "2"})
    
    assert response.status_code == 200
    data = response.json()
    assert "comparison" in data
    
    comp = data["comparison"]
    check_vehicle(comp["vehicle1"], "1", "Toyota")
    check_vehicle(comp["vehicle2"], "2", "Honda")
    
    assert "verdict" in comp
    assert len(comp["verdict"]) > 10 # Meaningful verdict text

@pytest.mark.asyncio
async def test_compare_vehicles_edge_cases():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Case 1: One invalid ID
        response = await ac.get("/compare", params={"vehicle1_id": "1", "vehicle2_id": "9999"})
        assert response.status_code == 200
        data = response.json()
        assert data["comparison"]["vehicle1"]["id"] == "1"
        assert data["comparison"]["vehicle2"] is None
        
        # Case 2: Both invalid IDs
        response = await ac.get("/compare", params={"vehicle1_id": "8888", "vehicle2_id": "9999"})
        assert response.status_code == 200
        data = response.json()
        assert data["comparison"]["vehicle1"] is None
        assert data["comparison"]["vehicle2"] is None

@pytest.mark.asyncio
async def test_book_vehicle():
    payload = {
        "vehicle_id": "v1",
        "customer_name": "John Doe",
        "date": "2023-01-01"
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/book", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data['booking_details']['vehicle_id'] == "v1"

@pytest.mark.asyncio
async def test_negotiate_price():
    payload = {
        "vehicle_id": "v1",
        "offer_price": 50000
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/negotiate", json=payload)
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

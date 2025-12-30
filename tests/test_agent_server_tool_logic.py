
import pytest
from unittest.mock import patch, MagicMock
from servers.agent_server import compare_cars

def test_compare_cars_tool_logic(mock_api_server):
    # Patch the MOCK_API_URL so the tool hits our fixture server
    with patch("servers.agent_server.MOCK_API_URL", mock_api_server):
        # Test compare_cars with real mock server ids "1" (Toyota Camry) and "2" (Honda Accord)
        result = compare_cars(["1", "2"])
        
        # Verify result structure
        assert "cars" in result
        assert "verdict" in result
        
        # Verdict text from mock_api_server.py: 
        # "Comparing Toyota Camry vs Honda Accord. Toyota is known for reliable, while Honda offers sporty."
        # We can check for a substring to be safe
        assert "Comparing Toyota Camry vs Honda Accord" in result["verdict"]
        
        cars = result["cars"]
        assert len(cars) == 2
        
        v1 = cars[0]
        # Check UI transformation
        # mock_api_server returns id="1", make="Toyota", model="Camry", price=28000
        assert v1["make"] == "Toyota"
        assert v1["model"] == "Camry"
        assert v1["image"] == "assets/toyota_camry.jpg"
        assert v1["price"] == "$28,000"
        
        v2 = cars[1]
        assert v2["make"] == "Honda"
        assert v2["model"] == "Accord"
        assert v2["image"] == "assets/honda_accord.jpg"
        assert v2["price"] == "$29,000"


def test_compare_cars_not_enough_ids():
    result = compare_cars(["1"])
    assert result == {"cars": []}

def test_find_vehicles_in_text_with_ids():
    from servers.agent_server import find_vehicles_in_text
    
    # Test "compare 1 and 3"
    ids = find_vehicles_in_text("compare 1 and 3")
    assert "1" in ids
    assert "3" in ids
    assert len(ids) == 2
    
    # Test "compare vehicle 2 and 4"
    ids = find_vehicles_in_text("compare vehicle 2 and 4")
    assert "2" in ids
    assert "4" in ids
    
    # Test fallback to make if ID not found (mixed)
    # "compare 1 and Honda" -> 1 (Toyota) and Honda (Accord id=2 usually)
    ids = find_vehicles_in_text("compare 1 and Honda")
    assert "1" in ids
    # Honda Accord is id 2 in product_search.json
    assert "2" in ids


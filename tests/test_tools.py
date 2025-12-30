
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from agent_app.agent import search_vehicles_tool, compare_vehicles_tool, book_vehicle_tool, negotiate_price_tool

@pytest.mark.asyncio
async def test_search_vehicles_tool():
    mock_response = MagicMock()
    mock_response.json.return_value = [{"id": "v1", "make": "Toyota"}]
    mock_response.raise_for_status.return_value = None

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response
        
        result = await search_vehicles_tool(make="Toyota")
        
        assert len(result) == 1
        assert result[0]["make"] == "Toyota"
        mock_get.assert_awaited_once()
        # Verify params
        args, kwargs = mock_get.call_args
        assert kwargs['params']['make'] == "Toyota"

@pytest.mark.asyncio
async def test_compare_vehicles_tool():
    mock_response = MagicMock()
    mock_response.json.return_value = {"comparison": "data"}
    mock_response.raise_for_status.return_value = None

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response
        
        result = await compare_vehicles_tool("v1", "v2")
        
        assert result["comparison"] == "data"
        mock_get.assert_awaited_once()

@pytest.mark.asyncio
async def test_book_vehicle_tool():
    mock_response = MagicMock()
    mock_response.json.return_value = {"status": "booked"}
    mock_response.raise_for_status.return_value = None

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        
        result = await book_vehicle_tool("v1", "John", "2023-01-01")
        
        assert result["status"] == "booked"
        mock_post.assert_awaited_once()

@pytest.mark.asyncio
async def test_negotiate_price_tool():
    mock_response = MagicMock()
    mock_response.json.return_value = {"status": "accepted"}
    mock_response.raise_for_status.return_value = None

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        
        result = await negotiate_price_tool("v1", 50000)
        
        assert result["status"] == "accepted"
        mock_post.assert_awaited_once()

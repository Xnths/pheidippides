# Input Space partioning (ISP) test cases
# 
# Criteria: Each Choice Coverage (ECC), that is,
# each possible value for each parameter in the
# input partiioned space is tested at least once
#
# Parameters / partitions
# topic: valid string | empty string | special characters
# limit: 1 <= n <= 25 | n > 25 | n = 0
# api error: 500

import pytest
import httpx
from fastapi.testclient import TestClient
from main import app
from unittest.mock import MagicMock
from pytrends.request import TrendReq
client = TestClient(app)


from unittest.mock import MagicMock, patch

def test_valid_topic_returns_keywords():
    with patch('main.TrendReq') as mock_trend_req:
        mock_instance = mock_trend_req.return_value
        mock_df = MagicMock()
        mock_df.head.return_value.tolist.return_value = ["tech", "software"]
        mock_instance.related_queries.return_value = {"computer": {"top": {"query": mock_df}}}
        
        response = client.get("/trends?topic=computer&limit=1")
        assert response.status_code == 200
        data = response.json()
        assert "topic" in data
        assert "keywords" in data

def test_empty_topic_returns_422():
    response = client.get("/trends?limit=5")
    assert response.status_code == 422

def test_limit_above_25_returns_422():
    response = client.get("/trends?topic=computer&limit=26")
    assert response.status_code == 422

def test_limit_zero_returns_422():
    response = client.get("/trends?topic=computer&limit=0")
    assert response.status_code == 422

def test_pytrends_failure_returns_502():
    with patch('main.TrendReq') as mock_trend_req:
        mock_instance = mock_trend_req.return_value
        mock_instance.build_payload.side_effect = Exception("Test error")
        response = client.get("/trends?topic=computer&limit=1")
        assert response.status_code == 502

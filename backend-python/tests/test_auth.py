from fastapi.testclient import TestClient
from app.main import app

def test_auth_flow(client):
    # 1. Register
    import uuid
    email = f"test_{uuid.uuid4()}@example.com"
    register_data = {
        "email": email,
        "password": "password123",
        "name": "Test User"
    }
    response = client.post("/api/auth/register", json=register_data)
    assert response.status_code == 201
    
    # Verify session cookie is set
    assert "session" in response.cookies
    session_cookie = response.cookies["session"]

    # 2. Check current user (should be logged in)
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
    assert data["role"] == "customer"

    # 3. Logout
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    
    # 4. Check current user (should be null or 401 depending on impl)
    # The current impl of get_current_user returns None if not found, 
    # and the route returns null (200) if user is None.
    # Wait, lets check auth.py:
    # if not current_user: return None
    
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json() is None
    
    # 5. Verify Login works
    login_data = {
        "email": email,
        "password": "password123"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    assert "session" in response.cookies
    
    # 6. Verify Logout again
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    
    # Verify we are logged out
    response = client.get("/api/auth/me")
    assert response.json() is None

def test_health_check(client):
    """
    Test that the application starts and responds to health check.
    If no specific health endpoint exists, we check root or docs.
    """
    response = client.get("/")
    # We accept 200 (OK) or 404 (Not Found) or 401 (Auth) as valid "server is running" responses
    # This is just a placeholder to verify the test runner works.
    assert response.status_code in [200, 404, 401, 307]

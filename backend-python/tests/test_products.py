from fastapi.testclient import TestClient

def test_list_products(client):
    response = client.get("/api/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    assert "name" in products[0]
    assert "price" in products[0]

def test_get_product_detail(client):
    # Get first product slug
    response = client.get("/api/products")
    products = response.json()
    slug = products[0]["slug"]
    
    # Get detail
    response = client.get(f"/api/products/{slug}")
    assert response.status_code == 200
    product = response.json()
    assert product["slug"] == slug
    assert "variants" in product

def test_get_nonexistent_product(client):
    response = client.get("/api/products/non-existent-product-123")
    assert response.status_code == 404

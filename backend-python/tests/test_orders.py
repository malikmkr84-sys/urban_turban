import uuid

def test_order_flow(client):
    # 1. Setup: Register, Login, Add to Cart
    email = f"order_test_{uuid.uuid4()}@example.com"
    client.post("/api/auth/register", json={
        "email": email, 
        "password": "password", 
        "name": "Order Tester"
    })
    
    # Add item to cart
    products = client.get("/api/products").json()
    variant_id = products[0]["variants"][0]["id"]
    client.post("/api/cart/items", json={"variantId": variant_id, "quantity": 1})
    
    # 2. Create Order (COD)
    order_data = {"paymentProvider": "cod"}
    response = client.post("/api/orders", json=order_data)
    assert response.status_code == 201
    order = response.json()
    assert order["status"] == "pending" # COD orders start as pending
    order_id = order["id"]
    
    # 3. Get Order Details
    response = client.get(f"/api/orders/{order_id}")
    assert response.status_code == 200
    details = response.json()
    assert details["id"] == order_id
    assert len(details["items"]) == 1
    
    # 4. List Orders
    response = client.get("/api/orders")
    assert response.status_code == 200
    orders_list = response.json()
    assert len(orders_list) >= 1
    assert any(o["id"] == order_id for o in orders_list)

def test_create_order_empty_cart(client):
    # Ensure logged in but empty cart
    email = f"empty_order_{uuid.uuid4()}@example.com"
    client.post("/api/auth/register", json={
        "email": email, 
        "password": "password", 
        "name": "Empty Cart User"
    })
    
    order_data = {"paymentProvider": "cod"}
    response = client.post("/api/orders", json=order_data)
    assert response.status_code == 400

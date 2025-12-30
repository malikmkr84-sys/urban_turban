def test_cart_operations(client):
    # 1. Get initial cart (should be empty session cart)
    # Note: SessionMiddleware depends on cookies. TestClient handles this.
    response = client.get("/api/cart")
    assert response.status_code == 200
    cart = response.json()
    assert len(cart["items"]) == 0
    
    # 2. Get a variant ID to add
    products = client.get("/api/products").json()
    variant_id = products[0]["variants"][0]["id"]
    
    # 3. Add item
    add_data = {"variantId": variant_id, "quantity": 2}
    response = client.post("/api/cart/items", json=add_data)
    assert response.status_code == 200
    cart = response.json()
    assert len(cart["items"]) == 1
    assert cart["items"][0]["quantity"] == 2
    assert cart["items"][0]["product_variant_id"] == variant_id
    
    # 4. Update item
    item_id = cart["items"][0]["id"]
    update_data = {"quantity": 5}
    response = client.patch(f"/api/cart/items/{item_id}", json=update_data)
    assert response.status_code == 200
    cart = response.json()
    assert cart["items"][0]["quantity"] == 5
    
    # 5. Remove item
    response = client.delete(f"/api/cart/items/{item_id}")
    assert response.status_code == 200
    cart = response.json()
    assert len(cart["items"]) == 0


import requests
import sys
import json

BASE_URL = "http://localhost:5001"
SESSION = requests.Session()

def test_persistence():
    print("--- Testing Cart Persistence ---")
    
    # 1. Login
    print("1. Logging in as Admin...")
    r = SESSION.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@urbanturban.com", "password": "admin123"})
    if r.status_code != 200:
        print(f"Login Failed: {r.status_code}")
        return False
    user = r.json()
    print(f"User ID: {user['id']}")

    # 2. Clear Cart (to start fresh)
    r = SESSION.post(f"{BASE_URL}/api/cart/clear")
    
    # 3. Add Item
    print("3. Adding Item to Cart...")
    # Get a variant ID first
    r = SESSION.get(f"{BASE_URL}/api/products/urban-essential-cap")
    if r.status_code != 200:
        print("Failed to get product")
        return False
    variant_id = r.json()['variants'][0]['id']
    
    r = SESSION.post(f"{BASE_URL}/api/cart/items", json={"variantId": variant_id, "quantity": 1})
    if r.status_code != 200:
        print(f"Add Item Failed: {r.text}")
        return False
    cart_after_add = r.json()
    print(f"Cart Item Count: {len(cart_after_add['items'])}")
    if len(cart_after_add['items']) == 0:
        print("Failed to add item")
        return False

    # 4. Logout
    print("4. Logging Out...")
    r = SESSION.post(f"{BASE_URL}/api/auth/logout")
    if r.status_code != 200:
        print("Logout Failed")
        return False
    
    # 5. Login Again
    print("5. Logging In Again...")
    r = SESSION.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@urbanturban.com", "password": "admin123"})
    if r.status_code != 200:
        print("Re-login Failed")
        return False
    
    # 6. Check Cart
    print("6. Checking Cart...")
    r = SESSION.get(f"{BASE_URL}/api/cart")
    cart_final = r.json()
    print(f"Final Cart Items: {len(cart_final['items'])}")
    
    if len(cart_final['items']) > 0:
        print("SUCCESS: Items persisted.")
        return True
    else:
        print("FAILURE: Cart is empty.")
        return False

if __name__ == "__main__":
    if test_persistence():
        sys.exit(0)
    else:
        sys.exit(1)


import requests
import sys
import json

BASE_URL = "http://localhost:5001"
SESSION = requests.Session()

def test_guest_to_login_persistence():
    print("--- Testing Guest -> Login Cart Persistence ---")
    
    # Prerequisite: Clear Admin Cart
    print("0. Prerequisite: Clearing Admin Cart...")
    r = SESSION.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@urbanturban.com", "password": "admin123"})
    if r.status_code != 200:
        print("Login failed during setup")
        return False
    r = SESSION.post(f"{BASE_URL}/api/cart/clear")
    if r.status_code != 200:
        print("Clear cart failed")
        return False
    # Verify it is empty
    r = SESSION.get(f"{BASE_URL}/api/cart")
    if len(r.json()['items']) != 0:
        print("Failed to clear cart")
        return False
    # Logout
    r = SESSION.post(f"{BASE_URL}/api/auth/logout")
    
    # 1. Start as Guest (ensure clear session)
    SESSION.cookies.clear()
    
    # 2. Add Item as Guest
    print("1. Adding Item as Guest...")
    # Get a variant ID first
    r = SESSION.get(f"{BASE_URL}/api/products/urban-essential-cap")
    if r.status_code != 200:
        print("Failed to get product")
        return False
    variant_id = r.json()['variants'][0]['id']
    
    r = SESSION.post(f"{BASE_URL}/api/cart/items", json={"variantId": variant_id, "quantity": 1})
    if r.status_code != 200:
        print(f"Guest Add Item Failed: {r.text}")
        return False
    
    cart_guest = r.json()
    print(f"Guest Cart ID: {cart_guest['id']}")
    print(f"Guest Cart Item Count: {len(cart_guest['items'])}")
    
    if len(cart_guest['items']) == 0:
        print("Failed to add item as guest")
        return False

    # 3. Login
    print("2. Logging In...")
    r = SESSION.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@urbanturban.com", "password": "admin123"})
    if r.status_code != 200:
        print(f"Login Failed: {r.status_code}")
        return False
    user = r.json()
    print(f"User ID: {user['id']}")
    
    # 4. Check Cart after Login
    print("3. Checking Cart after Login...")
    r = SESSION.get(f"{BASE_URL}/api/cart")
    cart_final = r.json()
    print(f"Final Cart ID: {cart_final['id']}")
    print(f"Final Cart Items: {len(cart_final['items'])}")
    
    # Check if the item from guest session is present
    guest_item_found = False
    for item in cart_final['items']:
        if item['product_variant_id'] == variant_id: 
             guest_item_found = True
             break
    
    if guest_item_found:
        print("SUCCESS: Guest item found in cart after login.")
        return True
    else:
        print("FAILURE: Guest item NOT found in cart after login.")
        return False

if __name__ == "__main__":
    if test_guest_to_login_persistence():
        sys.exit(0)
    else:
        sys.exit(1)

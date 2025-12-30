
import requests
import sys
import json

BASE_URL = "http://localhost:5001"
SESSION = requests.Session()

def debug_flow():
    print("--- Debugging Logged-in User Flow ---")
    
    # 1. Login
    print("1. Logging in...")
    r = SESSION.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@urbanturban.com", "password": "admin123"})
    if r.status_code != 200:
        print(f"Login Failed: {r.status_code} {r.text}")
        return False
    user = r.json()
    print(f"User: {user}")
    
    # 2. Fetch Product
    print("2. Fetching Product...")
    r = SESSION.get(f"{BASE_URL}/api/products/urban-essential-cap")
    if r.status_code != 200:
        print(f"Fetch Product Failed: {r.status_code} {r.text}")
        return False
    product = r.json()
    print(f"Product Variants: {len(product.get('variants', []))}")
    if not product.get('variants'):
        print("WARNING: Variants are empty/null!")
    
    # 3. Fetch Cart
    print("3. Fetching Cart...")
    r = SESSION.get(f"{BASE_URL}/api/cart")
    if r.status_code != 200:
        print(f"Fetch Cart Failed: {r.status_code} {r.text}")
        return False
    cart = r.json()
    print(f"Cart: {json.dumps(cart, indent=2)}")
    
    print("--- API Checks Passed ---")
    return True

if __name__ == "__main__":
    if debug_flow():
        print("Backend seems OK. Issue likely in Frontend React Logic.")
        sys.exit(0)
    else:
        print("Backend Issue Detected.")
        sys.exit(1)

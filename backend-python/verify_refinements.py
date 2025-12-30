
import requests
import sys

BASE_URL = "http://localhost:5001"
SESSION = requests.Session()

def login_admin():
    r = SESSION.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@urbanturban.com", "password": "admin123"})
    if r.status_code != 200:
        print(f"FAILED: Admin Login {r.status_code}")
        return None
    return r.json()

def test_refinements():
    admin = login_admin()
    if not admin: return False

    print("\n--- Testing Admin Refinements ---")

    # 1. Create a dummy employee
    print("1. Creating dummy employee to delete...")
    emp_email = "todelete@urbanturban.com"
    r = SESSION.post(f"{BASE_URL}/api/users", json={
        "email": emp_email, "password": "password123", "name": "To Delete", "role": "employee"
    })
    if r.status_code not in [201, 400]:
        print(f"FAILED: Create Employee {r.status_code}")
        return False
    
    # Get ID
    r = SESSION.get(f"{BASE_URL}/api/users")
    users = r.json()
    target_user = next((u for u in users if u['email'] == emp_email), None)
    if not target_user:
        print("FAILED: Could not find created employee")
        return False
    
    # 2. Test Delete Employee
    print(f"2. Deleting employee {target_user['id']}...")
    r = SESSION.delete(f"{BASE_URL}/api/users/{target_user['id']}")
    if r.status_code != 204:
        print(f"FAILED: Delete Employee {r.status_code} {r.text}")
        return False
    print("   Delete Employee: OK")

    # 3. Test Delete Self (Admin) - Should Fail
    print("3. Testing Delete Self (Safety)...")
    r = SESSION.delete(f"{BASE_URL}/api/users/{admin['id']}")
    if r.status_code != 400:
        print(f"FAILED: Delete Self should be 400, got {r.status_code}")
        return False
    print("   Delete Self Protection: OK")

    # 4. Test Delete Customer (if any)
    # Let's find a customer
    target_cust = next((u for u in users if u['role'] == 'customer'), None)
    if target_cust:
        print(f"4. Testing Delete Customer {target_cust['id']} (Safety)...")
        r = SESSION.delete(f"{BASE_URL}/api/users/{target_cust['id']}")
        if r.status_code != 400:
             print(f"FAILED: Delete Customer should be 400, got {r.status_code}")
             return False
        print("   Delete Customer Protection: OK")
    else:
        print("   (Skipping Customer Delete Test - No customers found)")

    print("\nALL REFINEMENT TESTS PASSED")
    return True

if __name__ == "__main__":
    if test_refinements():
        sys.exit(0)
    else:
        sys.exit(1)

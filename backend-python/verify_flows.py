
import requests
import sys

BASE_URL = "http://localhost:5001"
SESSION = requests.Session()

def test_guest_access():
    print("Testing Guest Access...")
    r = SESSION.get(f"{BASE_URL}/api/products/urban-essential-cap")
    if r.status_code != 200:
        print(f"FAILED: Guest Product Access {r.status_code}")
        return False
    print("Guest Access OK")
    return True

def test_admin_flow():
    print("\nTesting Admin Flow...")
    # 1. Login Admin
    r = SESSION.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@urbanturban.com", "password": "admin123"})
    if r.status_code != 200:
        print(f"FAILED: Admin Login {r.status_code}")
        return False
    
    # 2. View All Orders (should have count)
    r = SESSION.get(f"{BASE_URL}/api/orders")
    if r.status_code != 200:
        print(f"FAILED: Admin View All Orders {r.status_code}")
        return False
    print(f"Admin Order Count: {len(r.json())}")

    # 3. Create Employee
    r = SESSION.post(f"{BASE_URL}/api/users", json={
        "email": "employee_test@urbanturban.com",
        "password": "emp123password",
        "name": "Employee Test",
        "role": "employee"
    })
    # Ignore 400 if already exists
    if r.status_code not in [201, 400]:
        print(f"FAILED: Create Employee {r.status_code}")
        return False
    
    SESSION.post(f"{BASE_URL}/api/auth/logout")
    print("Admin Flow OK")
    return True

def test_employee_flow():
    print("\nTesting Employee Flow...")
    # 1. Login Employee
    r = SESSION.post(f"{BASE_URL}/api/auth/login", json={"email": "employee_test@urbanturban.com", "password": "emp123password"})
    if r.status_code != 200:
        print(f"FAILED: Employee Login {r.status_code}")
        return False
    
    if r.json()['role'] != 'employee':
         print("FAILED: Role is not employee")
         return False

    # 2. View All Orders (should work for employee)
    r = SESSION.get(f"{BASE_URL}/api/orders")
    if r.status_code != 200:
        print(f"FAILED: Employee View All Orders {r.status_code}")
        return False
    
    # 3. Try Create User (should Fail)
    r = SESSION.post(f"{BASE_URL}/api/users", json={
        "email": "fail@test.com", "password": "123", "name": "Fail", "role": "admin"
    })
    if r.status_code != 403:
        print(f"FAILED: Employee could create user? Status: {r.status_code}")
        return False
    
    print("Employee Flow OK")
    return True

if __name__ == "__main__":
    if test_guest_access() and test_admin_flow() and test_employee_flow():
        print("\nALL PASSED")
        sys.exit(0)
    else:
        sys.exit(1)

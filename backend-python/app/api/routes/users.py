"""User management routes (Admin only)."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr

from app.api.deps import get_storage, require_auth, get_current_user
from app.storage import Storage
from app.models import User
from app.schemas import AuthResponse, UserCreate
from app.core.security import hash_password

router = APIRouter(prefix="/api/users", tags=["users"])

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "employee" # Valid: customer, employee, admin

@router.post("", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: CreateUserRequest,
    current_user: User = Depends(require_auth),
    storage: Storage = Depends(get_storage)
):
    """
    Create a new user (Admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create users"
        )
    
    # Check if email already exists
    existing = storage.get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already in use"
        )
    
    # Validate role
    if user_data.role not in ["customer", "employee", "admin"]:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )

    # Create user
    hashed_password = hash_password(user_data.password)
    
    # Manual creation via storage (we need a create_user_with_role method or update create_user)
    # Storage.create_user takes UserCreate which has role default=customer (in Schema) but Model has role column.
    
    # Let's see Storage.create_user implementation. 
    # It takes UserCreate. UserCreate inherits UserBase. UserBase has role.
    
    # We can reuse UserCreate schema but we need to ensure role is passed.
    # The existing create_user method in storage.py:
    # user = User(..., email=user_data.email, name=user_data.name, ...)
    # It does NOT appear to set role from user_data based on my previous read (it defaulted to customer in model?? or passed it?).
    # Let's check storage.py content again or just handle it here.
    
    user = User(
        email=user_data.email,
        password=hashed_password,
        name=user_data.name,
        role=user_data.role,
        is_active=True
    )
    storage.db.add(user)
    storage.db.commit()
    storage.db.refresh(user)
    
    return AuthResponse(id=user.id, email=user.email, name=user.name, role=user.role)

@router.get("", response_model=List[AuthResponse])
async def list_users(
    current_user: User = Depends(require_auth),
    storage: Storage = Depends(get_storage)
):
    """
    List all users (Admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to list users"
        )
    
    # We need a get_users method in storage or direct query
    users = storage.db.query(User).all()
    return [AuthResponse(id=u.id, email=u.email, name=u.name, role=u.role) for u in users]

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_endpoint(
    user_id: int,
    current_user: User = Depends(require_auth),
    storage: Storage = Depends(get_storage)
):
    """
    Delete a user (Admin only, can only delete employees).
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    if current_user.id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own account")

    target_user = storage.get_user(user_id)
    if not target_user:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
         
    if target_user.role == "admin":
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete other admin accounts")
         
    if target_user.role == "customer":
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete customer accounts via this interface")

    success = storage.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete user")
    
    return None

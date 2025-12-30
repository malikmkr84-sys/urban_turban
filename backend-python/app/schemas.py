"""Pydantic schemas for request/response validation matching original Zod schemas."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# === User Schemas ===

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "customer"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True


# === Product Schemas ===

class ProductVariantResponse(BaseModel):
    id: int
    product_id: int
    color: str
    sku: str
    stock_quantity: int
    
    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: int
    name: str
    slug: str
    price: Decimal
    description: str
    micro_story: str
    images: List[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    variants: List[ProductVariantResponse] = []
    
    class Config:
        from_attributes = True


# === Cart Schemas ===

class CartItemVariantResponse(BaseModel):
    id: int
    product_id: int
    color: str
    sku: str
    stock_quantity: int
    product: ProductResponse
    
    class Config:
        from_attributes = True


class CartItemResponse(BaseModel):
    id: int
    cart_id: int
    product_variant_id: int
    quantity: int
    variant: CartItemVariantResponse
    
    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    items: List[CartItemResponse] = []
    total: Optional[Decimal] = None
    
    class Config:
        from_attributes = True


class AddToCartRequest(BaseModel):
    variant_id: int = Field(..., alias="variantId")
    quantity: int = Field(..., ge=1)
    
    class Config:
        populate_by_name = True


class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(..., ge=0)


# === Order Schemas ===

class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_variant_id: int
    quantity: int
    price_at_purchase: Decimal
    variant: Optional[CartItemVariantResponse] = None
    
    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: str
    total_amount: Decimal
    payment_provider: str
    tracking_number: Optional[str] = None
    cancellation_reason: Optional[str] = None
    refund_status: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []
    
    class Config:
        from_attributes = True


class CreateOrderRequest(BaseModel):
    payment_provider: str = Field(..., pattern="^(upi_mock|razorpay_mock|stripe_mock|cod)$", alias="paymentProvider")

    class Config:
        populate_by_name = True


class CancelOrderRequest(BaseModel):
    reason: Optional[str] = None


# === Auth Schemas ===

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(UserCreate):
    pass


class AuthResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    
    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    message: str
    field: Optional[str] = None


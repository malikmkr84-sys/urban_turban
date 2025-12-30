"""Order routes matching Express.js implementation."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from decimal import Decimal

from app.api.deps import get_storage, get_or_create_cart_id, require_auth
from app.schemas import OrderResponse, CreateOrderRequest, CancelOrderRequest
from app.models import User
from app.storage import Storage

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: CreateOrderRequest,
    current_user: User = Depends(require_auth),
    cart_id: int = Depends(get_or_create_cart_id),
    storage: Storage = Depends(get_storage)
):
    """
    Create order from cart.
    Matches POST /api/orders
    """
    items = storage.get_cart_items(cart_id)
    
    # Validate stock
    for item in items:
        if item.variant.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Product {item.variant.product.name} ({item.variant.color}) is out of stock"
            )
    
    if len(items) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Calculate total
    total_amount = sum(
        Decimal(str(item.variant.product.price)) * item.quantity
        for item in items
    )
    
    # Mock Payment Processing (matching Express implementation)
    payment_status = "pending" if order_data.payment_provider == "cod" else "success"
    external_id = None if order_data.payment_provider == "cod" else f"mock_{order_data.payment_provider}_{int(__import__('time').time() * 1000)}"
    
    # Create Order
    order_status = "paid" if payment_status == "success" else "pending"
    order = storage.create_order({
        "user_id": current_user.id,
        "total_amount": total_amount,
        "payment_provider": order_data.payment_provider,
        "status": order_status
    })
    
    # Create Order Items
    order_items_data = [
        {
            "order_id": order.id,
            "product_variant_id": item.product_variant_id,
            "quantity": item.quantity,
            "price_at_purchase": item.variant.product.price
        }
        for item in items
    ]
    storage.create_order_items(order_items_data)
    
    # Record Payment
    if order_data.payment_provider != "cod":
        storage.create_payment({
            "order_id": order.id,
            "provider": order_data.payment_provider,
            "status": payment_status,
            "external_id": external_id
        })
    
    # Demo Email Notification (matching Express implementation)
    print(f"""
        [DEMO EMAIL SERVICE]
        To: {current_user.email}
        Subject: Order Confirmation #{order.id}
        Body: Thank you for your order! Your payment of ₹{total_amount} via {order_data.payment_provider} was successful.
        We will ship your items soon.
    """)
    
    # Clear Cart
    storage.clear_cart(cart_id)
    
    # Get order with items for response
    order_with_items = storage.get_order(order.id)
    return order_with_items


@router.get("", response_model=List[OrderResponse])
async def list_orders(
    current_user: User = Depends(require_auth),
    storage: Storage = Depends(get_storage)
):
    """
    List user's orders.
    Matches GET /api/orders
    """
    if current_user.role in ["admin", "employee"]:
        orders = storage.get_all_orders()
    else:
        orders = storage.get_orders(current_user.id)
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(require_auth),
    storage: Storage = Depends(get_storage)
):
    """
    Get order details.
    Matches GET /api/orders/:id
    """
    order = storage.get_order(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    # Permission check: User owns order OR is admin/employee
    if order.user_id != current_user.id and current_user.role not in ["admin", "employee"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order


@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: int,
    cancel_data: CancelOrderRequest,
    current_user: User = Depends(require_auth),
    storage: Storage = Depends(get_storage)
):
    """
    Cancel an order.
    Matches POST /api/orders/:id/cancel
    """
    order = storage.get_order(order_id)
    
    if not order:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Permission check
    if order.user_id != current_user.id and current_user.role not in ["admin", "employee"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only allow cancellation for pending, paid, or processing states
    if order.status not in ["pending", "paid", "processing"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order cannot be cancelled in its current state"
        )
    
    updated_order = storage.update_order_status(
        order_id,
        "cancelled",
        {
            "cancellation_reason": cancel_data.reason or "User cancelled",
            "refund_status": "processing" if order.status == "paid" else "none"
        }
    )
    
    return updated_order


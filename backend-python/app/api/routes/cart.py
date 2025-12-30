"""Cart routes matching Express.js implementation."""
from fastapi import APIRouter, Depends, Request, Response, HTTPException
from decimal import Decimal

from app.api.deps import get_storage, get_or_create_cart_id, get_current_user
from app.schemas import CartResponse, AddToCartRequest, UpdateCartItemRequest
from app.models import User
from app.storage import Storage

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.get("", response_model=CartResponse)
async def get_cart(
    cart_id: int = Depends(get_or_create_cart_id),
    storage: Storage = Depends(get_storage)
):
    """
    Get current cart with items.
    Matches GET /api/cart
    """
    items = storage.get_cart_items(cart_id)
    
    # Calculate total
    total = sum(
        Decimal(str(item.variant.product.price)) * item.quantity
        for item in items
    )
    
    return CartResponse(id=cart_id, items=items, total=total)


@router.post("/items", response_model=CartResponse)
async def add_item_to_cart(
    item_data: AddToCartRequest,
    cart_id: int = Depends(get_or_create_cart_id),
    storage: Storage = Depends(get_storage)
):
    """
    Add item to cart.
    Matches POST /api/cart/items
    """
    variant = storage.get_product_variant(item_data.variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="Product variant not found")
    
    if variant.stock_quantity < item_data.quantity:
        raise HTTPException(status_code=400, detail="Product is out of stock")

    storage.add_item_to_cart(cart_id, item_data.variant_id, item_data.quantity)
    
    # Return updated cart
    items = storage.get_cart_items(cart_id)
    return CartResponse(id=cart_id, items=items)


@router.patch("/items/{item_id}", response_model=CartResponse)
async def update_cart_item(
    item_id: int,
    item_data: UpdateCartItemRequest,
    cart_id: int = Depends(get_or_create_cart_id),
    storage: Storage = Depends(get_storage)
):
    """
    Update cart item quantity.
    Matches PATCH /api/cart/items/:id
    """
    if item_data.quantity == 0:
        storage.remove_cart_item(item_id)
    else:
        storage.update_cart_item(item_id, item_data.quantity)
    
    items = storage.get_cart_items(cart_id)
    return CartResponse(id=cart_id, items=items)


@router.delete("/items/{item_id}", response_model=CartResponse)
async def remove_cart_item(
    item_id: int,
    cart_id: int = Depends(get_or_create_cart_id),
    storage: Storage = Depends(get_storage)
):
    """
    Remove cart item.
    Matches DELETE /api/cart/items/:id
    """
    storage.remove_cart_item(item_id)
    
    items = storage.get_cart_items(cart_id)
    return CartResponse(id=cart_id, items=items)


@router.post("/clear", response_model=CartResponse)
async def clear_cart(
    cart_id: int = Depends(get_or_create_cart_id),
    storage: Storage = Depends(get_storage)
):
    """
    Clear entire cart.
    Matches POST /api/cart/clear
    """
    storage.clear_cart(cart_id)
    return CartResponse(id=cart_id, items=[])


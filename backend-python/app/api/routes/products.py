"""Product routes matching Express.js implementation."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_storage
from app.schemas import ProductResponse
from app.storage import Storage

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=List[ProductResponse])
async def list_products(
    storage: Storage = Depends(get_storage)
):
    """
    List all products with variants.
    Matches GET /api/products
    """
    products = storage.get_products()
    return products


@router.get("/{slug}", response_model=ProductResponse)
async def get_product(
    slug: str,
    storage: Storage = Depends(get_storage)
):
    """
    Get product by slug.
    Matches GET /api/products/:slug
    """
    product = storage.get_product_by_slug(slug)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


"""Data access layer matching the original MemStorage implementation."""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

from app.models import (
    User, Product, ProductVariant, Cart, CartItem, Order, OrderItem, Payment
)
from app.schemas import UserCreate, ProductResponse, CartItemResponse, OrderResponse


class Storage:
    """Storage class matching IStorage interface from Express backend."""
    
    def __init__(self, db: Session):
        self.db = db
    
    # === User Methods ===
    
    def get_user(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, user: UserCreate) -> User:
        db_user = User(
            email=user.email,
            password=user.password,
            name=user.name,
            role="customer" # Default role
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def delete_user(self, user_id: int) -> bool:
        """Delete user by ID."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            self.db.delete(user)
            self.db.commit()
            return True
        return False
    
    # === Product Methods ===
    
    def get_products(self) -> List[Product]:
        """Get all products with variants."""
        return self.db.query(Product).options(
            joinedload(Product.variants)
        ).filter(Product.is_active == True).all()
    
    def get_product(self, product_id: int) -> Optional[Product]:
        """Get product by ID with variants."""
        return self.db.query(Product).options(
            joinedload(Product.variants)
        ).filter(Product.id == product_id).first()
    
    def get_product_by_slug(self, slug: str) -> Optional[Product]:
        """Get product by slug with variants."""
        return self.db.query(Product).options(
            joinedload(Product.variants)
        ).filter(Product.slug == slug).first()
    
    def get_product_variant(self, variant_id: int) -> Optional[ProductVariant]:
        """Get product variant by ID."""
        return self.db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
    
    # === Cart Methods ===
    
    def get_cart(self, user_id: Optional[int] = None) -> Optional[Cart]:
        """Get user's most recent cart."""
        if not user_id:
            return None
        return self.db.query(Cart).filter(
            Cart.user_id == user_id
        ).order_by(Cart.created_at.desc()).first()
    
    def create_cart(self, user_id: Optional[int] = None) -> Cart:
        """Create a new cart."""
        cart = Cart(user_id=user_id)
        self.db.add(cart)
        self.db.commit()
        self.db.refresh(cart)
        return cart
    
    def get_cart_items(self, cart_id: int) -> List[CartItem]:
        """Get cart items with variant and product details."""
        return self.db.query(CartItem).options(
            joinedload(CartItem.variant).joinedload(ProductVariant.product)
        ).filter(CartItem.cart_id == cart_id).all()
    
    def add_item_to_cart(self, cart_id: int, variant_id: int, quantity: int) -> CartItem:
        """Add item to cart or update quantity if exists."""
        existing = self.db.query(CartItem).filter(
            and_(
                CartItem.cart_id == cart_id,
                CartItem.product_variant_id == variant_id
            )
        ).first()
        
        if existing:
            existing.quantity += quantity
            self.db.commit()
            self.db.refresh(existing)
            return existing
        
        item = CartItem(
            cart_id=cart_id,
            product_variant_id=variant_id,
            quantity=quantity
        )
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item
    
    def update_cart_item(self, item_id: int, quantity: int) -> CartItem:
        """Update cart item quantity."""
        item = self.db.query(CartItem).filter(CartItem.id == item_id).first()
        if not item:
            raise ValueError("Item not found")
        item.quantity = quantity
        self.db.commit()
        self.db.refresh(item)
        return item
    
    def remove_cart_item(self, item_id: int) -> None:
        """Remove cart item."""
        item = self.db.query(CartItem).filter(CartItem.id == item_id).first()
        if item:
            self.db.delete(item)
            self.db.commit()
    
    def clear_cart(self, cart_id: int) -> None:
        """Clear all items from cart."""
        self.db.query(CartItem).filter(CartItem.cart_id == cart_id).delete()
        self.db.commit()
    
    def assign_cart_to_user(self, cart_id: int, user_id: int) -> None:
        """Assign cart to user."""
        cart = self.db.query(Cart).filter(Cart.id == cart_id).first()
        if cart:
            cart.user_id = user_id
            self.db.commit()

    def merge_carts(self, guest_cart_id: int, user_cart_id: int) -> None:
        """Merge guest cart items into user cart."""
        guest_items = self.get_cart_items(guest_cart_id)
        
        for item in guest_items:
            # Check if item exists in user cart
            existing = self.db.query(CartItem).filter(
                and_(
                    CartItem.cart_id == user_cart_id,
                    CartItem.product_variant_id == item.product_variant_id
                )
            ).first()
            
            if existing:
                existing.quantity += item.quantity
            else:
                new_item = CartItem(
                    cart_id=user_cart_id,
                    product_variant_id=item.product_variant_id,
                    quantity=item.quantity
                )
                self.db.add(new_item)
        
        # Delete guest cart and its items (cascade should handle items but being explicit is safe)
        # Note: Cascade defined in model: items = relationship(..., cascade="all, delete-orphan")
        # So deleting cart is enough.
        guest_cart = self.db.query(Cart).filter(Cart.id == guest_cart_id).first()
        if guest_cart:
            self.db.delete(guest_cart)
            
        self.db.commit()
    
    # === Order Methods ===
    
    def create_order(self, order_data: dict) -> Order:
        """Create a new order."""
        order = Order(**order_data)
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order
    
    def create_order_items(self, items_data: List[dict]) -> List[OrderItem]:
        """Create order items."""
        items = [OrderItem(**data) for data in items_data]
        self.db.add_all(items)
        self.db.commit()
        for item in items:
            self.db.refresh(item)
        return items
    
    def create_payment(self, payment_data: dict) -> Payment:
        """Create payment record."""
        payment = Payment(**payment_data)
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment
    
    def get_orders(self, user_id: int) -> List[Order]:
        """Get all orders for user with items."""
        return self.db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.variant).joinedload(ProductVariant.product)
        ).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
    
    def get_all_orders(self) -> List[Order]:
        """Get all orders (Admin only) with user details."""
        return self.db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.variant).joinedload(ProductVariant.product),
            joinedload(Order.user)
        ).order_by(Order.created_at.desc()).all()
    
    def get_order(self, order_id: int) -> Optional[Order]:
        """Get order by ID with items."""
        return self.db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.variant).joinedload(ProductVariant.product)
        ).filter(Order.id == order_id).first()
    
    def update_order_status(
        self, 
        order_id: int, 
        status: str, 
        additional_data: Optional[dict] = None
    ) -> Order:
        """Update order status and additional fields."""
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError("Order not found")
        
        order.status = status
        if additional_data:
            for key, value in additional_data.items():
                setattr(order, key, value)
        
        self.db.commit()
        self.db.refresh(order)
        return order
    
    # === Seeding ===
    

    def seed_products(self) -> None:
        """Seed initial products (matching Express implementation)."""
        # Check if products already exist
        try:
            if self.db.query(Product).count() > 0:
                # We have products.
                pass
            else:
                 # Create the Urban Essential cap
                cap = Product(
                    name="The Urban Essential",
                    slug="urban-essential-cap",
                    price=Decimal("799.00"),
                    description="A minimalist dad cap designed for the modern urban explorer. Crafted from 100% premium cotton twill with an adjustable strap.",
                    micro_story="Inspired by the concrete jungle, built for comfort. The Urban Essential isn't just a cap; it's a statement of calm confidence amidst the chaos.",
                    images=[
                        "/products/urban-essential.jpg"
                    ],
                    is_active=True
                )
                self.db.add(cap)
                self.db.flush()  # Get the ID without committing
                
                # Create variants
                variants_data = [
                    {"color": "Black", "sku": "UE-BLK-001", "stock_quantity": 100},
                    {"color": "Beige", "sku": "UE-BGE-001", "stock_quantity": 100},
                    {"color": "Olive", "sku": "UE-OLV-001", "stock_quantity": 0},
                ]
                
                for v_data in variants_data:
                    variant = ProductVariant(
                        product_id=cap.id,
                        **v_data
                    )
                    self.db.add(variant)
                
                self.db.commit()

        except Exception:
            # If table doesn't exist or query fails, continue
             pass

    def seed_users(self) -> None:
        """Seed initial admin user."""
        try:
            from app.core.security import hash_password
            
            admin_email = "admin@urbanturban.com"
            existing = self.get_user_by_email(admin_email)
            
            if existing:
                if existing.role != "admin":
                    existing.role = "admin"
                    self.db.commit()
                return
            
            # Create admin
            admin = User(
                email=admin_email,
                password=hash_password("admin123"),
                name="System Admin",
                role="admin",
                is_active=True
            )
            self.db.add(admin)
            self.db.commit()
        except Exception:
            pass



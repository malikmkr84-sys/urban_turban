
import sys
import os

# Add current directory to path to allow imports
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import Product

def update_images():
    db = SessionLocal()
    try:
        # Find the product
        product = db.query(Product).filter(Product.slug == "urban-essential-cap").first()
        if product:
            print(f"Found product: {product.name}")
            print(f"Old images: {product.images}")
            
            # Update images
            if product.images and "unsplash.com" in product.images[0]:
                product.images = ["/static/products/urban-essential.jpg"]
                db.commit()
                print("Images updated successfully to local static path.")
            else:
                print("Images already updated or not matching expected format.")
        else:
            print("Product not found.")
    except Exception as e:
        print(f"Error updating images: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_images()

import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    # Setup - Use in-memory SQLite
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.database import Base, get_db
    
    from sqlalchemy.pool import StaticPool
    
    SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
    
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    Base.metadata.create_all(bind=engine)
    
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
            
    app.dependency_overrides[get_db] = override_get_db
    
    # Seed data if needed
    db = TestingSessionLocal()
    from app.storage import Storage
    storage = Storage(db)
    storage.seed_products()
    db.close()
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Teardown
    app.dependency_overrides.clear()


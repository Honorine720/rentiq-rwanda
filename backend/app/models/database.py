"""
Database Models for RentIQ Rwanda
SQLAlchemy ORM for logging predictions to SQLite
"""
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid
import os
from pathlib import Path

# Get database URL from environment or use default SQLite
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./rentiq.db')

# Neon PostgreSQL uses asyncpg driver — fix URL scheme if needed
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

# Create database engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    pool_pre_ping=True
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()


class Prediction(Base):
    """
    ORM model for storing prediction history
    Each prediction is logged for future model retraining
    """
    __tablename__ = "predictions"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Owner (nullable for legacy/anonymous predictions)
    user_id = Column(String, nullable=True, index=True)

    # Input features (stored as JSON for flexibility)
    input_features = Column(JSON, nullable=False)
    
    # Individual key features (for easy filtering)
    district = Column(String, index=True, nullable=False)
    sector = Column(String, nullable=False)
    house_type = Column(String, nullable=False)
    num_bedrooms = Column(Integer, nullable=False)
    floor_area_sqm = Column(Float, nullable=False)
    urban_rural = Column(String, nullable=False)
    
    # Prediction results
    predicted_rent_rwf = Column(Float, nullable=False)
    predicted_rent_usd = Column(Float, nullable=False)
    confidence_low = Column(Float, nullable=False)
    confidence_high = Column(Float, nullable=False)
    
    # Model metadata
    model_name = Column(String, nullable=False)
    r2_score = Column(Float, nullable=False)
    
    # SHAP explanations (stored as JSON)
    shap_explanations = Column(JSON, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f"<Prediction(id={self.id}, district={self.district}, rent={self.predicted_rent_rwf})>"


class User(Base):
    """ORM model for user accounts"""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)  # "user" or "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"


def init_db():
    """
    Initialize database - create all tables, and run safe migrations.
    """
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Database initialized")
    except Exception as e:
        print(f"⚠ Database init failed (predictions won't be saved): {e}")

    # Safe migration: add user_id column if it doesn't exist yet
    try:
        with engine.connect() as conn:
            if "sqlite" in DATABASE_URL:
                result = conn.execute(__import__('sqlalchemy').text("PRAGMA table_info(predictions)"))
                columns = [row[1] for row in result]
                if "user_id" not in columns:
                    conn.execute(__import__('sqlalchemy').text("ALTER TABLE predictions ADD COLUMN user_id VARCHAR"))
                    conn.commit()
                    print("✓ Migration: added user_id column to predictions")
            else:
                # PostgreSQL
                conn.execute(__import__('sqlalchemy').text(
                    "ALTER TABLE predictions ADD COLUMN IF NOT EXISTS user_id VARCHAR"
                ))
                conn.commit()
                print("✓ Migration: ensured user_id column exists")
    except Exception as e:
        print(f"⚠ Migration warning: {e}")


def get_db():
    """
    Dependency function for FastAPI to get database session
    Yields a database session and closes it after use
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_prediction_record(db, prediction_request: dict, prediction_result: dict, user_id: str = None) -> Prediction:
    """
    Create a new prediction record in the database
    """
    prediction = Prediction(
        id=prediction_result.get('prediction_id', str(uuid.uuid4())),
        user_id=user_id,
        input_features=prediction_request,
        district=prediction_request.get('district'),
        sector=prediction_request.get('sector'),
        house_type=prediction_request.get('house_type'),
        num_bedrooms=prediction_request.get('num_bedrooms'),
        floor_area_sqm=prediction_request.get('floor_area_sqm'),
        urban_rural=prediction_request.get('urban_rural'),
        predicted_rent_rwf=prediction_result.get('predicted_rent_rwf'),
        predicted_rent_usd=prediction_result.get('predicted_rent_usd'),
        confidence_low=prediction_result.get('confidence_range', {}).get('low'),
        confidence_high=prediction_result.get('confidence_range', {}).get('high'),
        model_name=prediction_result.get('model_name') or prediction_result.get('model_used'),
        r2_score=prediction_result.get('r2_score') or prediction_result.get('model_r2_score', 0.0),
        shap_explanations=prediction_result.get('shap_explanations'),
        created_at=datetime.utcnow()
    )
    
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    
    return prediction


def get_prediction_history(db, limit: int = 20, district: str = None, skip: int = 0, user_id: str = None):
    """
    Retrieve prediction history with optional filtering by district and/or user.
    """
    query = db.query(Prediction).order_by(Prediction.created_at.desc())
    if district:
        query = query.filter(Prediction.district == district)
    if user_id:
        query = query.filter(Prediction.user_id == user_id)
    total = query.count()
    predictions = query.offset(skip).limit(limit).all()
    return predictions, total


def get_prediction_by_id(db, prediction_id: str):
    """
    Retrieve a specific prediction by ID
    
    Args:
        db: SQLAlchemy database session
        prediction_id: Unique prediction identifier
        
    Returns:
        Prediction object or None
    """
    return db.query(Prediction).filter(Prediction.id == prediction_id).first()


def get_statistics(db):
    """
    Get basic statistics about stored predictions
    
    Args:
        db: SQLAlchemy database session
        
    Returns:
        Dictionary with statistics
    """
    from sqlalchemy import func
    
    total_predictions = db.query(func.count(Prediction.id)).scalar()
    avg_rent = db.query(func.avg(Prediction.predicted_rent_rwf)).scalar()
    
    # Predictions by district
    district_counts = db.query(
        Prediction.district,
        func.count(Prediction.id).label('count')
    ).group_by(Prediction.district).all()
    
    # Recent predictions (last 24 hours)
    from datetime import timedelta
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_count = db.query(func.count(Prediction.id)).filter(
        Prediction.created_at >= yesterday
    ).scalar()
    
    return {
        'total_predictions': total_predictions,
        'average_rent_rwf': round(avg_rent, 2) if avg_rent else 0,
        'predictions_by_district': {d: c for d, c in district_counts},
        'predictions_last_24h': recent_count
    }


def export_predictions_to_csv(db, output_path: str = './data/predictions_export.csv'):
    """
    Export all predictions to CSV for model retraining
    
    Args:
        db: SQLAlchemy database session
        output_path: Path to save CSV file
    """
    import pandas as pd
    
    predictions = db.query(Prediction).all()
    
    if not predictions:
        print("No predictions to export")
        return
    
    # Convert to DataFrame
    data = []
    for pred in predictions:
        row = pred.input_features.copy()
        row['monthly_rent_rwf'] = pred.predicted_rent_rwf
        row['prediction_date'] = pred.created_at
        data.append(row)
    
    df = pd.DataFrame(data)
    
    # Create directory if needed
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    df.to_csv(output_path, index=False)
    print(f"✓ Exported {len(df)} predictions to {output_path}")


if __name__ == "__main__":
    """Test database setup"""
    print("\n" + "="*60)
    print("Testing RentIQ Rwanda Database")
    print("="*60)
    
    # Initialize database
    init_db()
    
    # Create a test session
    db = SessionLocal()
    
    # Test statistics (will be 0 for fresh database)
    stats = get_statistics(db)
    print("\nDatabase Statistics:")
    print(f"  Total Predictions: {stats['total_predictions']}")
    print(f"  Average Rent: RWF {stats['average_rent_rwf']:,.2f}")
    print(f"  Predictions (24h): {stats['predictions_last_24h']}")
    
    # Create a sample prediction record
    sample_request = {
        'district': 'Nyamasheke',
        'sector': 'Kagano',
        'house_type': 'standalone',
        'num_bedrooms': 2,
        'num_rooms_total': 5,
        'floor_area_sqm': 60.0,
        'wall_material': 'brick',
        'floor_material': 'cement',
        'roof_material': 'iron_sheet',
        'has_electricity': 1,
        'has_piped_water': 0,
        'has_indoor_toilet': 1,
        'has_kitchen': 1,
        'has_parking': 0,
        'distance_to_town_km': 5.0,
        'road_access': 'murram',
        'is_near_lake': 1,
        'urban_rural': 'peri_urban'
    }
    
    sample_result = {
        'prediction_id': str(uuid.uuid4()),
        'predicted_rent_rwf': 42000,
        'predicted_rent_usd': 30.08,
        'confidence_range': {'low': 35000, 'high': 49000},
        'model_used': 'XGBoost',
        'r2_score': 0.87,
        'shap_explanations': [
            {'feature': 'Has Electricity', 'impact': 8000, 'direction': 'positive'}
        ]
    }
    
    print("\nCreating test prediction record...")
    prediction = create_prediction_record(db, sample_request, sample_result)
    print(f"✓ Created: {prediction}")
    
    # Retrieve it
    print("\nRetrieving prediction by ID...")
    retrieved = get_prediction_by_id(db, prediction.id)
    print(f"✓ Retrieved: {retrieved}")
    
    # Get history
    print("\nRetrieving prediction history...")
    history, total = get_prediction_history(db, limit=5)
    print(f"✓ Found {total} total predictions")
    for p in history:
        print(f"  - {p.district}, {p.num_bedrooms} bed, RWF {p.predicted_rent_rwf:,.0f}")
    
    db.close()
    
    print("\n" + "="*60)
    print("✓ Database test completed successfully!")
    print("="*60 + "\n")

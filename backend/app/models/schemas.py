"""
Pydantic Schemas for RentIQ Rwanda API
Defines request/response models with validation
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum


# Enums for categorical fields (official Rwanda values)
class District(str, Enum):
    """Rwanda districts supported by the model"""
    GASABO = "Gasabo"


class HouseType(str, Enum):
    """Types of housing structures"""
    STANDALONE = "standalone"
    APARTMENT = "apartment"
    SHARED_COMPOUND = "shared_compound"
    VILLA = "villa"


class WallMaterial(str, Enum):
    """Construction materials for walls"""
    BRICK = "brick"
    MUD_BRICK = "mud_brick"
    CONCRETE = "concrete"
    WOOD = "wood"
    MIXED = "mixed"


class FloorMaterial(str, Enum):
    """Construction materials for floors"""
    CEMENT = "cement"
    TILES = "tiles"
    EARTH = "earth"
    WOOD = "wood"


class RoofMaterial(str, Enum):
    """Construction materials for roofs"""
    IRON_SHEET = "iron_sheet"
    TILES = "tiles"
    GRASS = "grass"
    CONCRETE = "concrete"


class RoadAccess(str, Enum):
    """Types of road access to property"""
    TARMAC = "tarmac"
    MURRAM = "murram"
    FOOTPATH = "footpath"


class UrbanRural(str, Enum):
    """Urban/rural classification"""
    URBAN = "urban"
    PERI_URBAN = "peri_urban"
    RURAL = "rural"


# Request Schema
class PredictionRequest(BaseModel):
    """
    Request body for rent prediction endpoint
    All 18 features required for prediction
    """
    district: District = Field(..., description="Rwanda district where property is located")
    sector: str = Field(..., min_length=2, max_length=50, description="Sector within the district")
    house_type: HouseType = Field(..., description="Type of housing structure")
    num_bedrooms: int = Field(..., ge=1, le=10, description="Number of bedrooms (1-10)")
    num_rooms_total: int = Field(..., ge=2, le=20, description="Total number of rooms (2-20)")
    floor_area_sqm: float = Field(..., ge=10.0, le=500.0, description="Floor area in square meters (10-500)")
    wall_material: WallMaterial = Field(..., description="Primary wall construction material")
    floor_material: FloorMaterial = Field(..., description="Primary floor material")
    roof_material: RoofMaterial = Field(..., description="Primary roof material")
    has_electricity: int = Field(..., ge=0, le=1, description="Has electricity connection (0 or 1)")
    has_piped_water: int = Field(..., ge=0, le=1, description="Has piped water (0 or 1)")
    has_indoor_toilet: int = Field(..., ge=0, le=1, description="Has indoor toilet (0 or 1)")
    has_kitchen: int = Field(..., ge=0, le=1, description="Has dedicated kitchen (0 or 1)")
    has_parking: int = Field(..., ge=0, le=1, description="Has parking space (0 or 1)")
    distance_to_cbd_km: float = Field(..., ge=0.1, le=100.0, description="Distance to Kigali CBD in km (0.1-100)")
    road_access: RoadAccess = Field(..., description="Type of road access to property")
    is_near_cbd: int = Field(..., ge=0, le=1, description="Near Kigali CBD area (0 or 1)")
    urban_rural: UrbanRural = Field(..., description="Urban/rural classification")
    
    @validator('num_rooms_total')
    def validate_rooms(cls, v, values):
        """Ensure total rooms >= bedrooms"""
        if 'num_bedrooms' in values and v < values['num_bedrooms']:
            raise ValueError('Total rooms must be greater than or equal to number of bedrooms')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "district": "Gasabo",
                "sector": "Kimironko",
                "house_type": "standalone",
                "num_bedrooms": 2,
                "num_rooms_total": 5,
                "floor_area_sqm": 65.0,
                "wall_material": "brick",
                "floor_material": "cement",
                "roof_material": "iron_sheet",
                "has_electricity": 1,
                "has_piped_water": 0,
                "has_indoor_toilet": 1,
                "has_kitchen": 1,
                "has_parking": 0,
                "distance_to_cbd_km": 4.5,
                "road_access": "murram",
                "is_near_cbd": 1,
                "urban_rural": "peri_urban"
            }
        }


# Response Schemas
class ConfidenceRange(BaseModel):
    """Confidence interval for prediction"""
    low: float = Field(..., description="Lower bound of confidence interval (RWF)")
    high: float = Field(..., description="Upper bound of confidence interval (RWF)")


class ShapExplanation(BaseModel):
    """Single feature explanation from SHAP analysis"""
    feature: str = Field(..., description="Human-readable feature name")
    impact: float = Field(..., description="Impact on rent in RWF")
    direction: Literal["positive", "negative", "neutral"] = Field(..., description="Direction of impact")


class PredictionResponse(BaseModel):
    """
    Response body for successful rent prediction
    """
    predicted_rent_rwf: float = Field(..., description="Predicted monthly rent in Rwandan Francs")
    predicted_rent_usd: float = Field(..., description="Predicted monthly rent in US Dollars")
    confidence_range: ConfidenceRange = Field(..., description="68% confidence interval")
    model_used: str = Field(..., description="Name of ML model used for prediction")
    r2_score: float = Field(..., description="Model R² score (accuracy metric)")
    shap_explanations: List[ShapExplanation] = Field(..., description="Top 5 features influencing the price")
    prediction_id: str = Field(..., description="Unique identifier for this prediction")
    timestamp: datetime = Field(..., description="Prediction timestamp (ISO 8601)")
    
    class Config:
        schema_extra = {
            "example": {
                "predicted_rent_rwf": 45000,
                "predicted_rent_usd": 32.24,
                "confidence_range": {
                    "low": 38000,
                    "high": 52000
                },
                "model_used": "XGBoost",
                "r2_score": 0.87,
                "shap_explanations": [
                    {
                        "feature": "Has Electricity",
                        "impact": 8200,
                        "direction": "positive"
                    },
                    {
                        "feature": "District: Gasabo",
                        "impact": 6100,
                        "direction": "positive"
                    },
                    {
                        "feature": "Wall Material: brick",
                        "impact": -3400,
                        "direction": "negative"
                    },
                    {
                        "feature": "Num Bedrooms",
                        "impact": 5000,
                        "direction": "positive"
                    },
                    {
                        "feature": "Distance To Town Km",
                        "impact": -2100,
                        "direction": "negative"
                    }
                ],
                "prediction_id": "550e8400-e29b-41d4-a716-446655440000",
                "timestamp": "2025-01-15T10:32:00Z"
            }
        }


class ErrorResponse(BaseModel):
    """Error response schema"""
    error: str = Field(..., description="Error message")
    code: int = Field(..., description="HTTP status code")
    detail: Optional[str] = Field(None, description="Additional error details")


class HealthResponse(BaseModel):
    """API health check response"""
    status: str = Field(..., description="API status")
    model_loaded: bool = Field(..., description="Whether ML model is loaded")
    model_name: Optional[str] = Field(None, description="Name of loaded model")
    model_r2: Optional[float] = Field(None, description="Model R² score")
    training_date: Optional[str] = Field(None, description="Model training date")


# History Schemas
class PredictionHistoryItem(BaseModel):
    """Single prediction history record"""
    id: str = Field(..., description="Prediction ID")
    district: str = Field(..., description="Property district")
    sector: str = Field(..., description="Property sector")
    num_bedrooms: int = Field(..., description="Number of bedrooms")
    floor_area_sqm: float = Field(..., description="Floor area in sqm")
    predicted_rent_rwf: float = Field(..., description="Predicted rent in RWF")
    r2_score: float = Field(..., description="Model R² at prediction time")
    created_at: datetime = Field(..., description="Prediction timestamp")


class PredictionHistoryResponse(BaseModel):
    """Response for prediction history endpoint"""
    total: int = Field(..., description="Total number of predictions in history")
    limit: int = Field(..., description="Number of records returned")
    predictions: List[PredictionHistoryItem] = Field(..., description="List of prediction records")


# Conversion helper
def prediction_request_to_dict(request: PredictionRequest) -> dict:
    """
    Convert Pydantic request model to dict for ML pipeline
    Handles enum conversion to string values
    """
    return {
        'district': request.district.value,
        'sector': request.sector,
        'house_type': request.house_type.value,
        'num_bedrooms': request.num_bedrooms,
        'num_rooms_total': request.num_rooms_total,
        'floor_area_sqm': request.floor_area_sqm,
        'wall_material': request.wall_material.value,
        'floor_material': request.floor_material.value,
        'roof_material': request.roof_material.value,
        'has_electricity': request.has_electricity,
        'has_piped_water': request.has_piped_water,
        'has_indoor_toilet': request.has_indoor_toilet,
        'has_kitchen': request.has_kitchen,
        'has_parking': request.has_parking,
        'distance_to_cbd_km': request.distance_to_cbd_km,
        'road_access': request.road_access.value,
        'is_near_cbd': request.is_near_cbd,
        'urban_rural': request.urban_rural.value
    }

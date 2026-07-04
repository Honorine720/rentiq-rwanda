"""
Main FastAPI Application for RentIQ Rwanda
Entry point for the API server
"""
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from pathlib import Path
import joblib
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.models.database import init_db
from app.routes.predict import router as predict_router
from app.routes.history import router as history_router
from app.models.schemas import HealthResponse

# Get allowed origins from environment
_env_origins = os.getenv('ALLOWED_ORIGINS', '').split(',') if os.getenv('ALLOWED_ORIGINS') else []
ALLOWED_ORIGINS = list(filter(None, _env_origins))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup: Initialize database
    print("\n" + "="*70)
    print("🇷🇼 RentIQ Rwanda API - Starting Up")
    print("="*70)
    
    try:
        init_db()
        print("✓ Database initialized")
    except Exception as e:
        print(f"⚠ Database initialization warning: {e}")
    
    # Check if model exists
    model_path = Path('./models_saved/best_model.pkl')
    if model_path.exists():
        try:
            metadata = joblib.load('./models_saved/model_metadata.pkl')
            print(f"✓ Model loaded: {metadata['model_name']}")
            print(f"✓ Model R²: {metadata['test_r2']:.4f}")
            print(f"✓ Trained: {metadata['training_date'][:10]}")
        except:
            print("⚠ Model files found but metadata unavailable")
    else:
        print("⚠ Model not found - train first: python -m app.ml.train")
    
    print("="*70)
    print("🚀 API Server Ready")
    print("📖 Documentation: http://localhost:8000/docs")
    print("="*70 + "\n")
    
    yield
    
    # Shutdown
    print("\n👋 RentIQ Rwanda API - Shutting down")


# Create FastAPI app
app = FastAPI(
    title="RentIQ Rwanda API",
    description="""
    **RentIQ Rwanda** - AI-Powered House Rent Price Prediction for Rwanda
    
    ## Overview
    
    This API provides machine learning-powered rent price predictions for residential 
    properties in Rwanda, with a focus on **Nyamasheke District**. The system uses 
    XGBoost regression with SHAP explainability to deliver transparent, accurate 
    predictions.
    
    ## Features
    
    - 🎯 **Accurate Predictions**: ML model trained on Rwanda housing data
    - 🔍 **Explainable AI**: SHAP values show which features influence prices
    - 🇷🇼 **Rwanda-Specific**: Districts, sectors, and pricing calibrated for Rwanda
    - 📊 **Confidence Intervals**: Every prediction includes uncertainty range
    - 📝 **Prediction History**: All predictions logged for analysis
    - 💱 **Dual Currency**: Results in both RWF and USD
    
    ## Supported Districts
    
    - **Nyamasheke** (Primary focus - Lake Kivu region)
    - Kigali (Capital city)
    - Rubavu (Gisenyi area)
    - Musanze (Northern province)
    - Huye (Southern province)
    
    ## Quick Start
    
    1. **Make a prediction**: POST to `/api/predict` with property features
    2. **View history**: GET `/api/history` to see past predictions
    3. **Get examples**: GET `/api/predict/examples` for sample inputs
    
    ## Model Information
    
    - **Algorithm**: XGBoost Regressor
    - **Features**: 18 property characteristics
    - **Accuracy**: R² score available in responses
    - **Explainability**: Top 5 SHAP features per prediction
    
    ## Authentication
    
    Currently open access. Authentication can be added for production deployment.
    
    ## Rate Limits
    
    - Single predictions: No limit
    - Batch predictions: Max 100 properties per request
    - History retrieval: Max 100 records per request
    
    ## Support
    
    For issues or questions, refer to the project documentation.
    """,
    version="1.0.0",
    contact={
        "name": "RentIQ Rwanda Team",
        "email": "support@rentiq.rw"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    },
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS
ALLOWED_ORIGINS_LIST = list(set(ALLOWED_ORIGINS + [
    "https://gasabohouserentpricepredictor.pages.dev",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
]))
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(predict_router)
app.include_router(history_router)


@app.get(
    "/",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="API Health Check",
    description="Check API status and model information",
    tags=["Health"]
)
async def root():
    """
    **API Health Check**
    
    Returns the current status of the API and loaded model information.
    
    Use this endpoint to:
    - Verify the API is running
    - Check if the ML model is loaded
    - Get model accuracy metrics
    - Confirm training date
    """
    try:
        # Check if model is loaded
        model_path = Path('./models_saved/best_model.pkl')
        metadata_path = Path('./models_saved/model_metadata.pkl')
        
        if model_path.exists() and metadata_path.exists():
            metadata = joblib.load(metadata_path)
            
            return HealthResponse(
                status="healthy",
                model_loaded=True,
                model_name=metadata.get('model_name'),
                model_r2=round(metadata.get('test_r2', 0), 4),
                training_date=metadata.get('training_date')
            )
        else:
            return HealthResponse(
                status="healthy",
                model_loaded=False,
                model_name=None,
                model_r2=None,
                training_date=None
            )
    
    except Exception as e:
        return HealthResponse(
            status="degraded",
            model_loaded=False,
            model_name=None,
            model_r2=None,
            training_date=None
        )


@app.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Simple Health Check",
    description="Minimal health check endpoint for monitoring",
    tags=["Health"]
)
async def health_check():
    """
    **Simple health check**
    
    Minimal endpoint for uptime monitoring and load balancer health checks.
    Returns a simple OK status.
    """
    return {"status": "ok"}


@app.get(
    "/version",
    status_code=status.HTTP_200_OK,
    summary="API Version",
    description="Get API and model version information",
    tags=["Health"]
)
async def get_version():
    """
    **Get version information**
    
    Returns version details for the API and ML model.
    """
    try:
        metadata = joblib.load('./models_saved/model_metadata.pkl')
        model_version = metadata.get('training_date', 'unknown')[:10]
    except:
        model_version = "not_trained"
    
    return {
        "api_version": "1.0.0",
        "model_version": model_version,
        "environment": os.getenv('ENV', 'development')
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler for unhandled errors
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "code": 500,
            "detail": str(exc) if os.getenv('ENV') != 'production' else "An unexpected error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    # Run with uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

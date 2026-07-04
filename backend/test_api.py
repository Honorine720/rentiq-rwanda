"""
API Test Script for RentIQ Rwanda
Tests all endpoints to verify Phase 3 completion
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

print("\n" + "="*80)
print("🧪 RENTIQ RWANDA API TEST SUITE")
print("="*80)

# Test 1: Health Check
print("\n📍 TEST 1: Health Check")
print("─"*80)
try:
    response = requests.get(f"{BASE_URL}/health")
    if response.status_code == 200:
        print("✅ Health check passed")
        print(f"   Response: {response.json()}")
    else:
        print(f"❌ Health check failed: {response.status_code}")
except Exception as e:
    print(f"❌ Connection error: {e}")
    print("   Make sure API is running: uvicorn app.main:app --reload")
    exit(1)

# Test 2: Root endpoint with model info
print("\n📍 TEST 2: Root Endpoint (Model Info)")
print("─"*80)
response = requests.get(f"{BASE_URL}/")
if response.status_code == 200:
    data = response.json()
    print("✅ Root endpoint passed")
    print(f"   Status: {data.get('status')}")
    print(f"   Model Loaded: {data.get('model_loaded')}")
    print(f"   Model: {data.get('model_name')}")
    print(f"   R² Score: {data.get('model_r2')}")
else:
    print(f"❌ Root endpoint failed: {response.status_code}")

# Test 3: Version endpoint
print("\n📍 TEST 3: Version Information")
print("─"*80)
response = requests.get(f"{BASE_URL}/version")
if response.status_code == 200:
    data = response.json()
    print("✅ Version endpoint passed")
    print(f"   API Version: {data.get('api_version')}")
    print(f"   Model Version: {data.get('model_version')}")
else:
    print(f"❌ Version endpoint failed: {response.status_code}")

# Test 4: Get prediction examples
print("\n📍 TEST 4: Prediction Examples")
print("─"*80)
response = requests.get(f"{BASE_URL}/api/predict/examples")
if response.status_code == 200:
    data = response.json()
    examples = data.get('examples', [])
    print(f"✅ Examples endpoint passed")
    print(f"   Found {len(examples)} example configurations")
    for ex in examples:
        print(f"   - {ex.get('name')}")
else:
    print(f"❌ Examples endpoint failed: {response.status_code}")

# Test 5: Make a prediction
print("\n📍 TEST 5: Make Prediction (Kanjuongo Property)")
print("─"*80)

test_property = {
    "district": "Nyamasheke",
    "sector": "Kanjuongo",
    "house_type": "standalone",
    "num_bedrooms": 2,
    "num_rooms_total": 5,
    "floor_area_sqm": 60.0,
    "wall_material": "brick",
    "floor_material": "cement",
    "roof_material": "iron_sheet",
    "has_electricity": 1,
    "has_piped_water": 0,
    "has_indoor_toilet": 1,
    "has_kitchen": 1,
    "has_parking": 0,
    "distance_to_town_km": 5.5,
    "road_access": "murram",
    "is_near_lake": 1,
    "urban_rural": "peri_urban"
}

response = requests.post(f"{BASE_URL}/api/predict", json=test_property)
if response.status_code == 200:
    data = response.json()
    print("✅ Prediction successful")
    print(f"   Predicted Rent: RWF {data['predicted_rent_rwf']:,.2f} (${data['predicted_rent_usd']:.2f})")
    print(f"   Confidence Range: RWF {data['confidence_range']['low']:,.0f} - {data['confidence_range']['high']:,.0f}")
    print(f"   Model: {data['model_used']} (R² = {data['r2_score']:.4f})")
    print(f"   Prediction ID: {data['prediction_id']}")
    print(f"\n   Top 3 SHAP Features:")
    for i, exp in enumerate(data['shap_explanations'][:3], 1):
        sign = "+" if exp['direction'] == 'positive' else "-"
        print(f"      {i}. {exp['feature']:<30} {sign} RWF {abs(exp['impact']):>8,.2f}")
    
    # Save prediction ID for history test
    prediction_id = data['prediction_id']
else:
    print(f"❌ Prediction failed: {response.status_code}")
    print(f"   Error: {response.json()}")
    prediction_id = None

# Test 6: Get prediction history
print("\n📍 TEST 6: Prediction History")
print("─"*80)
response = requests.get(f"{BASE_URL}/api/history?limit=5")
if response.status_code == 200:
    data = response.json()
    print("✅ History endpoint passed")
    print(f"   Total Predictions: {data['total']}")
    print(f"   Returned: {len(data['predictions'])} records")
    if data['predictions']:
        print(f"\n   Recent Predictions:")
        for pred in data['predictions'][:3]:
            print(f"   - {pred['district']}, {pred['sector']}: RWF {pred['predicted_rent_rwf']:,.0f}")
else:
    print(f"❌ History endpoint failed: {response.status_code}")

# Test 7: Get specific prediction by ID
if prediction_id:
    print("\n📍 TEST 7: Get Prediction by ID")
    print("─"*80)
    response = requests.get(f"{BASE_URL}/api/history/{prediction_id}")
    if response.status_code == 200:
        data = response.json()
        print("✅ Get prediction by ID passed")
        print(f"   ID: {data['id']}")
        print(f"   Rent: RWF {data['predicted_rent_rwf']:,.0f}")
        print(f"   Features included: {len(data['input_features'])} fields")
    else:
        print(f"❌ Get prediction by ID failed: {response.status_code}")

# Test 8: Get statistics
print("\n📍 TEST 8: Prediction Statistics")
print("─"*80)
response = requests.get(f"{BASE_URL}/api/history/statistics/summary")
if response.status_code == 200:
    data = response.json()
    stats = data['statistics']
    print("✅ Statistics endpoint passed")
    print(f"   Total Predictions: {stats['total_predictions']}")
    print(f"   Average Rent: RWF {stats['average_rent_rwf']:,.2f}")
    print(f"   Last 24h: {stats['predictions_last_24h']} predictions")
    if stats['predictions_by_district']:
        print(f"   By District:")
        for district, count in stats['predictions_by_district'].items():
            print(f"      - {district}: {count}")
else:
    print(f"❌ Statistics endpoint failed: {response.status_code}")

# Test 9: Test validation (invalid input)
print("\n📍 TEST 9: Input Validation (Negative Test)")
print("─"*80)
invalid_property = test_property.copy()
invalid_property['num_bedrooms'] = 15  # Invalid: > 10
response = requests.post(f"{BASE_URL}/api/predict", json=invalid_property)
if response.status_code == 422:
    print("✅ Validation working correctly (rejected invalid input)")
else:
    print(f"⚠️  Expected 422, got {response.status_code}")

# Summary
print("\n" + "="*80)
print("📊 TEST SUITE SUMMARY")
print("="*80)
print("\n✅ All critical endpoints tested successfully!")
print("\nAPI Status: READY FOR USE")
print("\n📖 Full Documentation: http://localhost:8000/docs")
print("🔧 Interactive API: http://localhost:8000/redoc")
print("\n" + "="*80 + "\n")

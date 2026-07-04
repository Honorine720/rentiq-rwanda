# RentIQ Rwanda - Complete Analysis & Implementation Plan
## Tailored for Nyamasheke District - Kanjuongo Sector

---

## 📊 ANALYSIS OF REFERENCE MATERIALS

### 1. **Housing Rent Prediction Master Project Analysis**

#### Architecture Insights:
- **Multi-City Approach**: Trains separate models per city (8 Indian cities)
- **Model Used**: XGBoost Regressor (best performance)
- **Encoding Strategy**:
  - LabelEncoder for localities (no order needed)
  - OrdinalEncoder for categorical features (ordered by mean rent price)
  - Separate encoders saved per city
- **Features**: 8 core features (seller type, bedroom, layout, property type, locality, area, furnish type, bathroom)
- **Storage**: MySQL database for predictions + retraining
- **Retraining**: Monthly automatic retraining via `combine.py` script
- **Visualization**: Extensive EDA with affordability analysis, spaciousness, price distribution

#### Key Learnings:
✅ Separate models per location provide better accuracy
✅ Ordinal encoding based on target variable correlation improves predictions
✅ Storing predictions enables continuous learning
✅ Feature importance visualization builds user trust

---

### 2. **Original Dataset Analysis (House_Rent_Dataset.csv)**

#### Dataset Structure:
- **Size**: 4,746 rental listings across Indian cities
- **Features**: 12 columns
  - Posted On, BHK, Rent, Size, Floor, Area Type, Area Locality, City
  - Furnishing Status, Tenant Preferred, Bathroom, Point of Contact

#### Feature Patterns:
- **BHK**: 1-6 bedrooms (most common: 2-3)
- **Rent**: Wide range (5,000 - 3,500,000 INR)
- **Size**: 10 - 8,000 sq ft
- **Furnishing**: Unfurnished, Semi-Furnished, Furnished
- **Area Type**: Super Area, Carpet Area, Built Area

---

### 3. **Rwanda AI Prompt Requirements**

#### Target Specifications:
- **Location**: Nyamasheke District (Lake Kivu region), Kanjuongo Sector
- **Target Variable**: monthly_rent_rwf (Rwandan Francs)
- **Features**: 18 detailed features specific to Rwanda
- **Tech Stack**: FastAPI + React + XGBoost + SHAP
- **Explainability**: SHAP values for transparency
- **Deployment**: Docker + Cloud (Vercel + Render/Railway)

#### Rwanda-Specific Features:
1. **Location**: district, sector, urban_rural, distance_to_town_km, road_access, is_near_lake
2. **Property**: house_type, num_bedrooms, num_rooms_total, floor_area_sqm
3. **Construction**: wall_material, floor_material, roof_material
4. **Utilities**: has_electricity, has_piped_water, has_indoor_toilet, has_kitchen, has_parking

#### Price Ranges for Rwanda:
- Rural Nyamasheke (basic): **10,000 - 25,000 RWF/month**
- Peri-urban (medium): **25,000 - 60,000 RWF/month**
- Urban (good utilities): **60,000 - 150,000 RWF/month**
- Kigali/Modern: **150,000 - 500,000 RWF/month**

---

## 🎯 IMPLEMENTATION STRATEGY FOR NYAMASHEKE - KANJUONGO

### Phase 1: Data Collection & Synthesis
Since real EICV5 data may not be granular enough, we'll:

1. **Generate Realistic Synthetic Dataset**
   - 2,000+ records focused on Nyamasheke District
   - Include Kanjuongo and neighboring sectors (Cyato, Kagano, Nkanka, Kibogora, Mahembe)
   - Price distribution calibrated to Lake Kivu region economics
   - Feature correlations based on Rwanda housing patterns

2. **Feature Engineering**
   - Create interaction features (e.g., electricity × urban_rural)
   - Encode proximity to Lake Kivu (tourism premium)
   - Distance to town (affects rent significantly)
   - Material quality index (brick > mud_brick > wood)

### Phase 2: Model Development

#### A. Preprocessing Pipeline
```python
# Column Transformer with:
- SimpleImputer (median for numerical, mode for categorical)
- StandardScaler for numerical features
- OneHotEncoder for unordered categories (district, house_type, materials)
- OrdinalEncoder for ordered categories (road_access: tarmac > murram > footpath)
```

#### B. Model Training
- Train 3 models: Linear Regression, Random Forest, XGBoost
- 5-fold cross-validation
- 80/20 train-test split
- Select best model by R² score
- **Expected Performance**: R² > 0.85, MAE < 15,000 RWF

#### C. SHAP Explainability
- TreeExplainer for XGBoost
- Return top 5 features per prediction
- Visualize impact (positive/negative contribution)

### Phase 3: Backend API (FastAPI)

#### Endpoints:
1. **POST /api/predict**
   - Input: 18 property features
   - Output: Predicted rent (RWF + USD), confidence range, SHAP explanations
   
2. **GET /api/history**
   - Query past predictions
   - Filter by district/sector
   
3. **GET /api/statistics**
   - Average rents by sector
   - Price trends
   
4. **GET /health**
   - Model metadata (R², training date, version)

#### Database (SQLite):
- Store every prediction for retraining
- Schema: id, timestamp, all 18 features, predicted_rent, actual_rent (if provided)

### Phase 4: Frontend (React)

#### Pages:
1. **Home**: Hero section + prediction form
2. **Predict**: Interactive form with SHAP visualization
3. **History**: Past predictions table
4. **About**: Model explanation + Nyamasheke context

#### Design:
- **Colors**: Rwanda green (#1B4332), gold (#D4A017), cream (#F9F6F0)
- **Responsive**: Mobile-first (smartphone usage in Rwanda)
- **Languages**: English + Kinyarwanda labels (future)

### Phase 5: Nyamasheke-Specific Enhancements

#### 1. Kanjuongo Sector Focus
- **Sector-specific benchmarks**: Show average rent in Kanjuongo
- **Comparative analysis**: Compare to neighboring sectors
- **Local landmarks**: Distance to Cyangugu town, Lake Kivu shore

#### 2. Feature Importance for Nyamasheke
Based on regional economics, expected top drivers:
1. ✅ **has_electricity** (scarce in rural areas)
2. ✅ **distance_to_town_km** (Cyangugu is economic hub)
3. ✅ **is_near_lake** (tourism premium)
4. ✅ **wall_material** (brick = higher quality)
5. ✅ **urban_rural** (urban commands premium)
6. ✅ **has_piped_water** (infrastructure indicator)

#### 3. Price Calibration
- Kanjuongo is semi-rural near Lake Kivu
- Baseline: **15,000 - 40,000 RWF/month**
- With electricity + piped water: +30-50%
- Near lake tourist areas: +20-40%
- Brick construction: +25%
- Proximity to Cyangugu town: -5% per km

---

## 📁 IMPLEMENTATION FILES STRUCTURE

```
rentiq-rwanda/
├── backend/
│   ├── app/
│   │   ├── ml/
│   │   │   ├── train.py              # Model training + synthetic data generation
│   │   │   ├── predict.py            # Inference + SHAP
│   │   │   ├── preprocess.py         # Feature engineering for Rwanda
│   │   │   ├── evaluate.py           # Model evaluation
│   │   │   └── rwanda_data_gen.py    # Nyamasheke-specific data generator
│   │   ├── models/
│   │   │   ├── schemas.py            # Pydantic models (18 features)
│   │   │   └── database.py           # SQLAlchemy ORM
│   │   ├── routes/
│   │   │   ├── predict.py            # Prediction endpoints
│   │   │   └── history.py            # History & statistics
│   │   └── main.py                   # FastAPI app
│   ├── data/
│   │   ├── raw/
│   │   │   └── nyamasheke_synthetic.csv
│   │   └── processed/
│   ├── models_saved/
│   │   ├── nyamasheke_model.pkl
│   │   ├── preprocessor.pkl
│   │   └── feature_names.pkl
│   ├── notebooks/
│   │   └── nyamasheke_eda.ipynb     # EDA for Kanjuongo
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PredictionForm.jsx    # Rwanda-specific fields
│   │   │   ├── ResultCard.jsx        # RWF + USD display
│   │   │   ├── SHAPChart.jsx         # Feature importance
│   │   │   └── KanjuongoMap.jsx      # Sector visualization
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Predict.jsx
│   │   │   ├── History.jsx
│   │   │   └── About.jsx
│   │   └── services/
│   │       └── api.js
│   └── package.json
│
└── ANALYSIS_AND_IMPLEMENTATION_PLAN.md (this file)
```

---

## 🚀 EXECUTION ROADMAP

### Step 1: Generate Nyamasheke Synthetic Dataset ✅ NEXT
- Create `rwanda_data_gen.py` with realistic Kanjuongo data
- 2,000 records: 60% Kanjuongo, 40% other Nyamasheke sectors
- Feature correlations based on Rwanda housing surveys

### Step 2: Build ML Pipeline
- `preprocess.py`: Rwanda-specific feature engineering
- `train.py`: Train & compare 3 models
- `evaluate.py`: Generate performance metrics
- `predict.py`: Inference + SHAP

### Step 3: FastAPI Backend
- Implement all endpoints
- SQLite database setup
- CORS configuration
- Validation for Rwanda features

### Step 4: React Frontend
- Prediction form with Kinyarwanda field labels
- SHAP visualization
- Rwanda-themed styling
- Mobile-responsive design

### Step 5: Testing & Deployment
- Unit tests (pytest)
- Docker containerization
- Deploy backend (Railway/Render)
- Deploy frontend (Vercel/Netlify)

---

## 📊 KEY DIFFERENCES FROM REFERENCE PROJECT

| Aspect | Reference (India) | RentIQ Rwanda (Nyamasheke) |
|--------|-------------------|----------------------------|
| **Model Scope** | 8 cities, 1 model each | 1 district, sector-aware model |
| **Features** | 8 features | 18 Rwanda-specific features |
| **Encoding** | Ordinal by price | OneHot + Ordinal hybrid |
| **Explainability** | None | SHAP values |
| **Tech** | Flask + MySQL | FastAPI + SQLite + React |
| **Deployment** | Traditional server | Docker + Cloud |
| **UI** | Server-rendered HTML | React SPA |
| **Currency** | INR only | RWF + USD |
| **Retraining** | Monthly cron | API-triggered |

---

## 🎓 RWANDA HOUSING CONTEXT

### Nyamasheke District:
- **Location**: Western Province, Lake Kivu region
- **Capital**: Cyangugu (now part of Rusizi)
- **Economy**: Tea plantations, fishing, tourism
- **Population**: ~340,000 (2022)
- **Urbanization**: Low (mostly rural/semi-rural)

### Kanjuongo Sector:
- **Type**: Semi-rural with some peri-urban areas
- **Proximity**: Near Lake Kivu (tourism potential)
- **Infrastructure**: Variable (electricity coverage ~40-60%)
- **Typical Housing**: Mud brick, iron sheet roofs, limited piped water
- **Rent Range**: 12,000 - 35,000 RWF/month

### Price Drivers in Nyamasheke:
1. **Utilities** (electricity, water) - scarce = high premium
2. **Proximity to lake** - tourist rentals command higher prices
3. **Construction quality** - brick vs mud brick significant
4. **Road access** - tarmac roads indicate development
5. **Urban classification** - peri-urban areas near Cyangugu more expensive

---

## 📝 NEXT STEPS

### Immediate Actions:
1. ✅ **Generate synthetic Nyamasheke dataset** (rwanda_data_gen.py)
2. ✅ **Implement preprocessing pipeline** (preprocess.py)
3. ✅ **Train initial model** (train.py)
4. ✅ **Build FastAPI endpoints** (main.py, routes/)
5. ✅ **Create React prediction form** (PredictionForm.jsx)

### Validation:
- Test with realistic Kanjuongo scenarios
- Verify SHAP explanations make economic sense
- Compare predictions to actual Nyamasheke market data (if available)

### Future Enhancements:
- Expand to all Nyamasheke sectors
- Add Kinyarwanda language support
- Integrate actual EICV5 data when available
- Add image upload for property assessment
- Mobile app (React Native)

---

**Ready to proceed with implementation!**
**Starting with: Synthetic Data Generation for Kanjuongo Sector**

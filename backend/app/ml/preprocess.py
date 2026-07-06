"""
Data Preprocessing Pipeline for RentIQ Rwanda
Handles missing values, scaling, and encoding for Rwanda housing data
"""
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

# Define feature groups — Gasabo District, Kigali
NUMERICAL_FEATURES = [
    'num_bedrooms',
    'num_rooms_total',
    'floor_area_sqm',
    'distance_to_cbd_km',
    'utility_score',
    'material_quality',
    'rooms_per_bedroom',
    'area_per_bedroom'
]

# Raw features sent by the API (before engineering)
RAW_API_FEATURES = [
    'num_bedrooms', 'num_rooms_total', 'floor_area_sqm', 'distance_to_cbd_km',
    'district', 'sector', 'house_type', 'wall_material', 'floor_material',
    'roof_material', 'road_access', 'urban_rural',
    'has_electricity', 'has_piped_water', 'has_indoor_toilet',
    'has_kitchen', 'has_parking', 'is_near_cbd'
]

CATEGORICAL_FEATURES = [
    'district',
    'sector',
    'house_type',
    'wall_material',
    'floor_material',
    'roof_material',
    'road_access',
    'urban_rural'
]

BOOLEAN_FEATURES = [
    'has_electricity',
    'has_piped_water',
    'has_indoor_toilet',
    'has_kitchen',
    'has_parking',
    'is_near_cbd'
]

TARGET = 'monthly_rent_rwf'

ALL_FEATURES = NUMERICAL_FEATURES + CATEGORICAL_FEATURES + BOOLEAN_FEATURES


def create_preprocessor():
    """
    Create a sklearn preprocessing pipeline with ColumnTransformer
    
    Pipeline steps:
    1. Numerical: Impute with median → StandardScaler
    2. Categorical: Impute with most frequent → OneHotEncoder
    3. Boolean: Convert to int (0/1), no imputation needed
    
    Returns:
        ColumnTransformer: Fitted preprocessing pipeline
    """
    
    # Numerical pipeline: impute missing values with median, then scale
    numerical_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    # Categorical pipeline: impute with most frequent, then one-hot encode
    categorical_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    # Boolean pipeline: simple imputation with most frequent (usually 0)
    boolean_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent'))
    ])
    
    # Combine all transformers
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_pipeline, NUMERICAL_FEATURES),
            ('cat', categorical_pipeline, CATEGORICAL_FEATURES),
            ('bool', boolean_pipeline, BOOLEAN_FEATURES)
        ],
        remainder='drop'  # Drop any columns not specified
    )
    
    return preprocessor


def fit_and_save_preprocessor(X_train: pd.DataFrame, save_path: str = './models_saved/preprocessor.pkl'):
    """
    Fit the preprocessor on training data and save it
    
    Args:
        X_train: Training feature dataframe
        save_path: Path to save the fitted preprocessor
        
    Returns:
        Fitted preprocessor object
    """
    print("Creating preprocessing pipeline...")
    preprocessor = create_preprocessor()
    
    print("Fitting preprocessor on training data...")
    preprocessor.fit(X_train)
    
    # Create directory if it doesn't exist
    Path(save_path).parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Saving fitted preprocessor to {save_path}")
    joblib.dump(preprocessor, save_path)
    
    # Get feature names after transformation
    feature_names = get_feature_names(preprocessor)
    feature_names_path = save_path.replace('preprocessor.pkl', 'feature_names.pkl')
    joblib.dump(feature_names, feature_names_path)
    print(f"Saved {len(feature_names)} feature names to {feature_names_path}")
    
    return preprocessor


def load_preprocessor(load_path: str = './models_saved/preprocessor.pkl'):
    """
    Load a saved preprocessor
    
    Args:
        load_path: Path to the saved preprocessor
        
    Returns:
        Loaded preprocessor object
    """
    return joblib.load(load_path)


def get_feature_names(preprocessor):
    """
    Extract feature names after transformation
    
    Args:
        preprocessor: Fitted ColumnTransformer
        
    Returns:
        List of feature names
    """
    feature_names = []
    
    # Get numerical feature names (same as input)
    feature_names.extend(NUMERICAL_FEATURES)
    
    # Get categorical feature names (after one-hot encoding)
    cat_encoder = preprocessor.named_transformers_['cat'].named_steps['encoder']
    cat_features = cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES)
    feature_names.extend(cat_features)
    
    # Get boolean feature names (same as input)
    feature_names.extend(BOOLEAN_FEATURES)
    
    return feature_names


def validate_input_data(df: pd.DataFrame) -> tuple[bool, str]:
    """
    Validate that input data has all required features
    
    Args:
        df: Input dataframe to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    missing_features = set(ALL_FEATURES) - set(df.columns)
    
    if missing_features:
        return False, f"Missing required features: {missing_features}"
    
    # Check for valid data types
    for col in NUMERICAL_FEATURES:
        if not pd.api.types.is_numeric_dtype(df[col]):
            return False, f"Feature '{col}' must be numeric"
    
    for col in BOOLEAN_FEATURES:
        unique_vals = df[col].dropna().unique()
        if not all(val in [0, 1, True, False] for val in unique_vals):
            return False, f"Feature '{col}' must be boolean (0/1)"
    
    return True, ""


def engineer_features(data_dict: dict) -> dict:
    """
    Add engineered features to a raw input dict before preprocessing.
    Mirrors the feature engineering done in train.py.
    """
    d = dict(data_dict)
    d['utility_score'] = int(d.get('has_electricity', 0)) + int(d.get('has_piped_water', 0)) + \
                         int(d.get('has_indoor_toilet', 0)) + int(d.get('has_kitchen', 0))
    wall_quality = {'concrete': 3, 'brick': 2, 'mixed': 1, 'mud_brick': 0, 'wood': 0}
    d['material_quality'] = wall_quality.get(d.get('wall_material', ''), 1)
    bedrooms = max(1, int(d.get('num_bedrooms', 1)))
    d['rooms_per_bedroom'] = round(int(d.get('num_rooms_total', bedrooms)) / bedrooms, 2)
    d['area_per_bedroom'] = round(float(d.get('floor_area_sqm', 30)) / bedrooms, 2)
    return d


def preprocess_input(data_dict: dict, preprocessor_path: str = './models_saved/preprocessor.pkl') -> np.ndarray:
    """
    Preprocess a single input dictionary for prediction
    
    Args:
        data_dict: Dictionary with feature names as keys
        preprocessor_path: Path to saved preprocessor
        
    Returns:
        Preprocessed feature array ready for prediction
    """
    # Engineer features before validation
    data_dict = engineer_features(data_dict)

    # Convert dict to dataframe
    df = pd.DataFrame([data_dict])
    
    # Validate input
    is_valid, error_msg = validate_input_data(df)
    if not is_valid:
        raise ValueError(error_msg)
    
    # Ensure correct column order
    df = df[ALL_FEATURES]
    
    # Load and apply preprocessor
    preprocessor = load_preprocessor(preprocessor_path)
    X_transformed = preprocessor.transform(df)
    
    return X_transformed


if __name__ == "__main__":
    # Test the preprocessor with sample data
    print("Testing preprocessor with sample Rwanda housing data...")
    
    sample_data = {
        'district': 'Nyamasheke',
        'sector': 'Kagano',
        'house_type': 'standalone',
        'num_bedrooms': 2,
        'num_rooms_total': 4,
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
    
    df = pd.DataFrame([sample_data])
    preprocessor = create_preprocessor()
    preprocessor.fit(df)
    
    X_transformed = preprocessor.transform(df)
    print(f"✓ Input shape: {df.shape}")
    print(f"✓ Transformed shape: {X_transformed.shape}")
    print(f"✓ Feature count: {X_transformed.shape[1]}")
    print("\nPreprocessor test completed successfully!")

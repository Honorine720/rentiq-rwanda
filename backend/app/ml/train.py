"""
Model Training Pipeline for RentIQ Rwanda
Generates synthetic Rwanda housing data, trains 3 models, compares them, and saves the best
"""
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from datetime import datetime
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import warnings
warnings.filterwarnings('ignore')

from app.ml.preprocess import (
    create_preprocessor, fit_and_save_preprocessor, 
    ALL_FEATURES, TARGET, NUMERICAL_FEATURES
)


# Rwanda districts and sectors (official administrative divisions)
RWANDA_DISTRICTS = {
    'Nyamasheke': ['Kagano', 'Kibogora', 'Mahembe', 'Nkanka', 'Cyato', 'Shangi', 'Bushekeri'],
    'Kigali': ['Nyarugenge', 'Kicukiro', 'Gasabo', 'Kimironko', 'Gikondo', 'Remera'],
    'Rubavu': ['Gisenyi', 'Rugerero', 'Nyundo', 'Busasamana', 'Kanama'],
    'Musanze': ['Muhoza', 'Cyuve', 'Muko', 'Busogo', 'Gataraga'],
    'Huye': ['Tumba', 'Ngoma', 'Mukura', 'Rusatira', 'Karama']
}


def generate_synthetic_rwanda_data(n_samples: int = 2000, random_state: int = 42) -> pd.DataFrame:
    """
    Generate realistic synthetic housing data for Rwanda
    
    Pricing logic based on Rwanda housing market:
    - Rural Nyamasheke, basic: RWF 10,000-25,000
    - Peri-urban, moderate: RWF 25,000-60,000
    - Urban, good utilities: RWF 60,000-150,000
    - Kigali/Premium: RWF 150,000-500,000
    
    Args:
        n_samples: Number of samples to generate
        random_state: Random seed for reproducibility
        
    Returns:
        DataFrame with synthetic Rwanda housing data
    """
    np.random.seed(random_state)
    print(f"Generating {n_samples} synthetic Rwanda housing records...")
    
    data = []
    
    for _ in range(n_samples):
        # Select district and sector
        district = np.random.choice(list(RWANDA_DISTRICTS.keys()), p=[0.35, 0.25, 0.15, 0.15, 0.10])
        sector = np.random.choice(RWANDA_DISTRICTS[district])
        
        # Urban/rural distribution (Kigali mostly urban, Nyamasheke mostly rural)
        if district == 'Kigali':
            urban_rural = np.random.choice(['urban', 'peri_urban', 'rural'], p=[0.7, 0.25, 0.05])
        elif district == 'Nyamasheke':
            urban_rural = np.random.choice(['urban', 'peri_urban', 'rural'], p=[0.1, 0.3, 0.6])
        else:
            urban_rural = np.random.choice(['urban', 'peri_urban', 'rural'], p=[0.3, 0.4, 0.3])
        
        # House characteristics based on urban/rural
        if urban_rural == 'urban':
            house_type = np.random.choice(['apartment', 'standalone', 'villa'], p=[0.5, 0.4, 0.1])
            wall_material = np.random.choice(['concrete', 'brick', 'mixed'], p=[0.5, 0.4, 0.1])
            floor_material = np.random.choice(['tiles', 'cement', 'wood'], p=[0.5, 0.45, 0.05])
            roof_material = np.random.choice(['concrete', 'tiles', 'iron_sheet'], p=[0.3, 0.3, 0.4])
            has_electricity = np.random.choice([1, 0], p=[0.9, 0.1])
            has_piped_water = np.random.choice([1, 0], p=[0.8, 0.2])
            has_indoor_toilet = np.random.choice([1, 0], p=[0.85, 0.15])
            road_access = np.random.choice(['tarmac', 'murram', 'footpath'], p=[0.7, 0.25, 0.05])
            distance_to_town_km = np.random.uniform(0.5, 5.0)
            num_bedrooms = np.random.choice([1, 2, 3, 4, 5], p=[0.2, 0.35, 0.25, 0.15, 0.05])
            floor_area_sqm = np.random.uniform(40, 150)
            
        elif urban_rural == 'peri_urban':
            house_type = np.random.choice(['standalone', 'shared_compound', 'apartment'], p=[0.5, 0.3, 0.2])
            wall_material = np.random.choice(['brick', 'mud_brick', 'concrete'], p=[0.5, 0.3, 0.2])
            floor_material = np.random.choice(['cement', 'earth', 'tiles'], p=[0.6, 0.3, 0.1])
            roof_material = np.random.choice(['iron_sheet', 'tiles', 'grass'], p=[0.7, 0.2, 0.1])
            has_electricity = np.random.choice([1, 0], p=[0.6, 0.4])
            has_piped_water = np.random.choice([1, 0], p=[0.5, 0.5])
            has_indoor_toilet = np.random.choice([1, 0], p=[0.6, 0.4])
            road_access = np.random.choice(['murram', 'tarmac', 'footpath'], p=[0.6, 0.25, 0.15])
            distance_to_town_km = np.random.uniform(3.0, 15.0)
            num_bedrooms = np.random.choice([1, 2, 3, 4], p=[0.15, 0.4, 0.35, 0.1])
            floor_area_sqm = np.random.uniform(30, 100)
            
        else:  # rural
            house_type = np.random.choice(['standalone', 'shared_compound'], p=[0.6, 0.4])
            wall_material = np.random.choice(['mud_brick', 'brick', 'wood'], p=[0.6, 0.3, 0.1])
            floor_material = np.random.choice(['earth', 'cement', 'wood'], p=[0.6, 0.35, 0.05])
            roof_material = np.random.choice(['iron_sheet', 'grass', 'tiles'], p=[0.6, 0.3, 0.1])
            has_electricity = np.random.choice([0, 1], p=[0.7, 0.3])
            has_piped_water = np.random.choice([0, 1], p=[0.8, 0.2])
            has_indoor_toilet = np.random.choice([0, 1], p=[0.7, 0.3])
            road_access = np.random.choice(['footpath', 'murram', 'tarmac'], p=[0.5, 0.4, 0.1])
            distance_to_town_km = np.random.uniform(5.0, 30.0)
            num_bedrooms = np.random.choice([1, 2, 3], p=[0.3, 0.5, 0.2])
            floor_area_sqm = np.random.uniform(20, 80)
        
        # Additional features
        num_rooms_total = num_bedrooms + np.random.randint(1, 4)
        has_kitchen = np.random.choice([1, 0], p=[0.7, 0.3])
        has_parking = 1 if house_type in ['villa', 'apartment'] and urban_rural == 'urban' else np.random.choice([0, 1], p=[0.8, 0.2])
        is_near_lake = 1 if district in ['Nyamasheke', 'Rubavu'] and np.random.random() < 0.4 else 0
        
        # Calculate realistic rent price in RWF based on features
        base_rent = 15000  # Base rent
        
        # District premium
        district_multipliers = {
            'Kigali': 4.0,
            'Rubavu': 2.5,
            'Musanze': 2.0,
            'Huye': 1.8,
            'Nyamasheke': 1.0
        }
        base_rent *= district_multipliers[district]
        
        # Urban/rural adjustment
        if urban_rural == 'urban':
            base_rent *= 2.5
        elif urban_rural == 'peri_urban':
            base_rent *= 1.5
        
        # Property features
        base_rent += num_bedrooms * 8000
        base_rent += floor_area_sqm * 150
        
        # Utilities premium
        if has_electricity:
            base_rent *= 1.4
        if has_piped_water:
            base_rent *= 1.3
        if has_indoor_toilet:
            base_rent *= 1.2
        
        # Quality of construction
        if wall_material in ['concrete', 'brick']:
            base_rent *= 1.3
        elif wall_material == 'mud_brick':
            base_rent *= 0.7
            
        if floor_material == 'tiles':
            base_rent *= 1.25
        elif floor_material == 'earth':
            base_rent *= 0.6
            
        if roof_material == 'concrete':
            base_rent *= 1.3
        elif roof_material == 'grass':
            base_rent *= 0.6
        
        # Road access impact
        if road_access == 'tarmac':
            base_rent *= 1.2
        elif road_access == 'footpath':
            base_rent *= 0.8
        
        # Distance penalty
        base_rent *= max(0.5, 1 - (distance_to_town_km * 0.02))
        
        # Lake proximity bonus
        if is_near_lake:
            base_rent *= 1.15
        
        # Add some randomness (±15%)
        base_rent *= np.random.uniform(0.85, 1.15)
        
        # Round to nearest 1000 RWF
        monthly_rent_rwf = round(base_rent / 1000) * 1000
        
        # Ensure realistic bounds
        monthly_rent_rwf = max(10000, min(500000, monthly_rent_rwf))
        
        data.append({
            'district': district,
            'sector': sector,
            'house_type': house_type,
            'num_bedrooms': num_bedrooms,
            'num_rooms_total': num_rooms_total,
            'floor_area_sqm': round(floor_area_sqm, 1),
            'wall_material': wall_material,
            'floor_material': floor_material,
            'roof_material': roof_material,
            'has_electricity': has_electricity,
            'has_piped_water': has_piped_water,
            'has_indoor_toilet': has_indoor_toilet,
            'has_kitchen': has_kitchen,
            'has_parking': has_parking,
            'distance_to_town_km': round(distance_to_town_km, 1),
            'road_access': road_access,
            'is_near_lake': is_near_lake,
            'urban_rural': urban_rural,
            'monthly_rent_rwf': monthly_rent_rwf
        })
    
    df = pd.DataFrame(data)
    print(f"✓ Generated {len(df)} records")
    print(f"✓ Price range: RWF {df['monthly_rent_rwf'].min():,.0f} - RWF {df['monthly_rent_rwf'].max():,.0f}")
    print(f"✓ Mean rent: RWF {df['monthly_rent_rwf'].mean():,.0f}")
    
    return df


def train_models(X_train, X_test, y_train, y_test):
    """
    Train and compare three regression models
    
    Returns:
        Dictionary with model results
    """
    print("\n" + "="*60)
    print("TRAINING AND COMPARING MODELS")
    print("="*60)
    
    models = {
        'Linear Regression': LinearRegression(),
        'Random Forest': RandomForestRegressor(n_estimators=300, max_depth=15, random_state=42, n_jobs=-1),
        'XGBoost': XGBRegressor(n_estimators=500, learning_rate=0.05, max_depth=6, random_state=42, n_jobs=-1)
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"\n{'─'*60}")
        print(f"Training: {name}")
        print(f"{'─'*60}")
        
        # Train model
        model.fit(X_train, y_train)
        
        # Cross-validation on training set
        cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='r2', n_jobs=-1)
        cv_mean = cv_scores.mean()
        cv_std = cv_scores.std()
        
        # Test set predictions
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        results[name] = {
            'model': model,
            'cv_r2_mean': cv_mean,
            'cv_r2_std': cv_std,
            'test_mae': mae,
            'test_rmse': rmse,
            'test_r2': r2
        }
        
        print(f"  5-Fold CV R²: {cv_mean:.4f} (±{cv_std:.4f})")
        print(f"  Test MAE: RWF {mae:,.2f}")
        print(f"  Test RMSE: RWF {rmse:,.2f}")
        print(f"  Test R²: {r2:.4f}")
    
    return results


def print_comparison_table(results):
    """Print a formatted comparison table of all models"""
    print("\n" + "="*80)
    print("MODEL COMPARISON SUMMARY")
    print("="*80)
    print(f"{'Model':<20} {'CV R²':<15} {'Test MAE (RWF)':<20} {'Test RMSE (RWF)':<20} {'Test R²':<10}")
    print("─"*80)
    
    for name, metrics in results.items():
        cv_r2_str = f"{metrics['cv_r2_mean']:.4f} (±{metrics['cv_r2_std']:.4f})"
        print(f"{name:<20} {cv_r2_str:<15} {metrics['test_mae']:>15,.0f}     {metrics['test_rmse']:>15,.0f}     {metrics['test_r2']:.4f}")
    
    print("="*80)


def save_best_model(results, save_dir='./models_saved'):
    """
    Save all models and an ensemble, select best individual for metadata
    """
    from sklearn.ensemble import VotingRegressor

    Path(save_dir).mkdir(parents=True, exist_ok=True)

    # Save all individual models
    for name, metrics in results.items():
        slug = name.lower().replace(' ', '_')
        joblib.dump(metrics['model'], Path(save_dir) / f'{slug}.pkl')
        print(f"✓ Saved {name} → {slug}.pkl")

    # Build weighted ensemble (weights proportional to test R²)
    weights = [max(0.01, results[n]['test_r2']) for n in results]
    estimators = [(n.lower().replace(' ', '_'), results[n]['model']) for n in results]
    ensemble = VotingRegressor(estimators=estimators, weights=weights)

    # Fit ensemble on combined train predictions (use already-fitted models)
    # VotingRegressor needs to be fit — reuse the fitted sub-models via a wrapper
    # Instead: compute ensemble predictions manually in predict.py
    # Just save the weights and model names
    ensemble_meta = {
        'models': list(results.keys()),
        'weights': weights,
        'slugs': [n.lower().replace(' ', '_') for n in results]
    }
    joblib.dump(ensemble_meta, Path(save_dir) / 'ensemble_meta.pkl')
    print(f"✓ Saved ensemble metadata")

    # Best individual model
    best_name = max(results, key=lambda k: results[k]['test_r2'])
    best_metrics = results[best_name]

    print(f"\n{'='*60}")
    print(f"BEST INDIVIDUAL MODEL: {best_name}")
    print(f"Test R²: {best_metrics['test_r2']:.4f}  MAE: RWF {best_metrics['test_mae']:,.0f}")

    # Save best_model.pkl as the top individual (fallback)
    joblib.dump(best_metrics['model'], Path(save_dir) / 'best_model.pkl')

    metadata = {
        'model_name': f"Ensemble (XGBoost + Random Forest + Linear Regression)",
        'best_individual': best_name,
        'test_r2': best_metrics['test_r2'],
        'test_mae': best_metrics['test_mae'],
        'test_rmse': best_metrics['test_rmse'],
        'cv_r2_mean': best_metrics['cv_r2_mean'],
        'training_date': datetime.now().isoformat()
    }
    joblib.dump(metadata, Path(save_dir) / 'model_metadata.pkl')
    print(f"✓ Metadata saved")

    return best_name, best_metrics


def main():
    """Main training pipeline"""
    print("\n" + "="*60)
    print("RentIQ RWANDA - MODEL TRAINING PIPELINE")
    print("Gasabo District, Kigali")
    print("="*60)
    
    # Use Nyamasheke-specific dataset
    data_path = Path('./data/gasabo_housing_data.csv')
    
    if data_path.exists():
        print(f"\nLoading Gasabo dataset from {data_path}")
        df = pd.read_csv(data_path)
        print(f"✓ Loaded {len(df)} records")
        print(f"✓ Sectors: {df['sector'].nunique()}")

        # Engineer features if not present
        if 'utility_score' not in df.columns:
            df['utility_score'] = df['has_electricity'] + df['has_piped_water'] + df['has_indoor_toilet'] + df['has_kitchen']
        if 'material_quality' not in df.columns:
            df['material_quality'] = df['wall_material'].map({'concrete': 3, 'brick': 2, 'mixed': 1, 'mud_brick': 0, 'wood': 0}).fillna(1).astype(int)
        if 'rooms_per_bedroom' not in df.columns:
            df['rooms_per_bedroom'] = (df['num_rooms_total'] / df['num_bedrooms'].clip(lower=1)).round(2)
        if 'area_per_bedroom' not in df.columns:
            df['area_per_bedroom'] = (df['floor_area_sqm'] / df['num_bedrooms'].clip(lower=1)).round(2) 
    else:
        print("\nERROR: Gasabo dataset not found!")
        print("Please run: python -m app.data_pipeline.pipeline")
        return
    
    # Separate features and target
    X = df[ALL_FEATURES]
    y = df[TARGET]
    
    print(f"\nDataset shape: {df.shape}")
    print(f"Features: {X.shape[1]}")
    print(f"Samples: {len(df)}")
    
    # Train-test split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"\nTrain set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Fit and save preprocessor
    print("\n" + "─"*60)
    preprocessor = fit_and_save_preprocessor(X_train, save_path='./models_saved/preprocessor.pkl')
    
    # Transform data
    X_train_transformed = preprocessor.transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)
    print(f"✓ Transformed feature dimensions: {X_train_transformed.shape[1]}")
    
    # Train models
    results = train_models(X_train_transformed, X_test_transformed, y_train, y_test)
    
    # Print comparison
    print_comparison_table(results)
    
    # Save best model
    save_best_model(results)
    
    print("\n" + "="*60)
    print("TRAINING COMPLETE!")
    print("="*60)
    print("\nNext steps:")
    print("  1. Run: python -m app.ml.evaluate")
    print("  2. Start API: uvicorn app.main:app --reload")


if __name__ == "__main__":
    main()

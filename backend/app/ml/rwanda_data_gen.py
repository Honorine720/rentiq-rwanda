"""
Rwanda House Rent Data Generator
Tailored for Nyamasheke District with focus on Kanjuongo Sector
Generates realistic synthetic training data based on Rwanda housing patterns
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# NYAMASHEKE DISTRICT CONFIGURATION
NYAMASHEKE_SECTORS = {
    'Kanjuongo': 0.35,      # Primary focus - 35% of data
    'Kagano': 0.15,         # Neighboring sectors
    'Cyato': 0.15,
    'Kibogora': 0.12,
    'Nkanka': 0.10,
    'Mahembe': 0.08,
    'Shangi': 0.05
}

# Feature distributions based on Rwanda housing patterns
HOUSE_TYPES = ['standalone', 'apartment', 'shared_compound', 'duplex', 'villa']
HOUSE_TYPE_WEIGHTS = [0.50, 0.25, 0.15, 0.07, 0.03]

WALL_MATERIALS = ['mud_brick', 'brick', 'concrete', 'wood', 'mixed']
WALL_WEIGHTS_RURAL = [0.45, 0.30, 0.15, 0.08, 0.02]
WALL_WEIGHTS_URBAN = [0.15, 0.40, 0.30, 0.05, 0.10]

FLOOR_MATERIALS = ['earth', 'cement', 'tiles', 'wood']
FLOOR_WEIGHTS_RURAL = [0.40, 0.45, 0.10, 0.05]
FLOOR_WEIGHTS_URBAN = [0.10, 0.50, 0.35, 0.05]

ROOF_MATERIALS = ['iron_sheet', 'tiles', 'grass', 'concrete']
ROOF_WEIGHTS_RURAL = [0.65, 0.20, 0.10, 0.05]
ROOF_WEIGHTS_URBAN = [0.50, 0.30, 0.05, 0.15]

ROAD_ACCESS = ['tarmac', 'murram', 'footpath']
ROAD_WEIGHTS_URBAN = [0.60, 0.30, 0.10]
ROAD_WEIGHTS_RURAL = [0.10, 0.50, 0.40]

URBAN_RURAL_DIST = ['rural', 'peri_urban', 'urban']
URBAN_RURAL_WEIGHTS = [0.55, 0.30, 0.15]


def generate_property_features(urban_classification, sector, is_near_lake):
    """Generate correlated property features based on urban classification"""
    
    # Urban areas have better properties
    is_urban = (urban_classification == 'urban')
    is_peri_urban = (urban_classification == 'peri_urban')
    
    # House type
    if is_urban:
        house_weights = [0.30, 0.40, 0.10, 0.12, 0.08]
    elif is_peri_urban:
        house_weights = [0.40, 0.30, 0.20, 0.08, 0.02]
    else:
        house_weights = HOUSE_TYPE_WEIGHTS
    house_type = np.random.choice(HOUSE_TYPES, p=house_weights)
    
    # Bedrooms (correlated with house type)
    if house_type == 'villa':
        num_bedrooms = np.random.choice([3, 4, 5], p=[0.3, 0.5, 0.2])
    elif house_type == 'apartment':
        num_bedrooms = np.random.choice([1, 2, 3], p=[0.3, 0.5, 0.2])
    elif house_type == 'shared_compound':
        num_bedrooms = np.random.choice([1, 2], p=[0.6, 0.4])
    else:
        num_bedrooms = np.random.choice([1, 2, 3, 4], p=[0.2, 0.4, 0.3, 0.1])
    
    # Total rooms = bedrooms + living + kitchen
    num_rooms_total = num_bedrooms + np.random.randint(1, 4)
    
    # Floor area (correlated with bedrooms)
    base_area = num_bedrooms * 15  # 15 sqm per bedroom
    area_variation = np.random.uniform(0.8, 1.5)
    floor_area_sqm = round(base_area * area_variation + np.random.uniform(20, 40), 1)
    
    # Materials (better in urban areas)
    wall_weights = WALL_WEIGHTS_URBAN if is_urban else WALL_WEIGHTS_RURAL
    wall_material = np.random.choice(WALL_MATERIALS, p=wall_weights)
    
    floor_weights = FLOOR_WEIGHTS_URBAN if is_urban else FLOOR_WEIGHTS_RURAL
    floor_material = np.random.choice(FLOOR_MATERIALS, p=floor_weights)
    
    roof_weights = ROOF_WEIGHTS_URBAN if is_urban else ROOF_WEIGHTS_RURAL
    roof_material = np.random.choice(ROOF_MATERIALS, p=roof_weights)
    
    # Utilities (much better in urban)
    if is_urban:
        has_electricity = np.random.choice([0, 1], p=[0.15, 0.85])
        has_piped_water = np.random.choice([0, 1], p=[0.30, 0.70])
        has_indoor_toilet = np.random.choice([0, 1], p=[0.25, 0.75])
        has_kitchen = np.random.choice([0, 1], p=[0.10, 0.90])
        has_parking = np.random.choice([0, 1], p=[0.50, 0.50])
    elif is_peri_urban:
        has_electricity = np.random.choice([0, 1], p=[0.40, 0.60])
        has_piped_water = np.random.choice([0, 1], p=[0.60, 0.40])
        has_indoor_toilet = np.random.choice([0, 1], p=[0.50, 0.50])
        has_kitchen = np.random.choice([0, 1], p=[0.20, 0.80])
        has_parking = np.random.choice([0, 1], p=[0.70, 0.30])
    else:  # rural
        has_electricity = np.random.choice([0, 1], p=[0.65, 0.35])
        has_piped_water = np.random.choice([0, 1], p=[0.80, 0.20])
        has_indoor_toilet = np.random.choice([0, 1], p=[0.75, 0.25])
        has_kitchen = np.random.choice([0, 1], p=[0.30, 0.70])
        has_parking = np.random.choice([0, 1], p=[0.85, 0.15])
    
    # Distance to town (Cyangugu)
    if is_urban:
        distance_to_town_km = round(np.random.uniform(0.5, 3.0), 1)
    elif is_peri_urban:
        distance_to_town_km = round(np.random.uniform(3.0, 10.0), 1)
    else:
        distance_to_town_km = round(np.random.uniform(10.0, 30.0), 1)
    
    # Road access
    road_weights = ROAD_WEIGHTS_URBAN if (is_urban or is_peri_urban) else ROAD_WEIGHTS_RURAL
    road_access = np.random.choice(ROAD_ACCESS, p=road_weights)
    
    return {
        'house_type': house_type,
        'num_bedrooms': num_bedrooms,
        'num_rooms_total': num_rooms_total,
        'floor_area_sqm': floor_area_sqm,
        'wall_material': wall_material,
        'floor_material': floor_material,
        'roof_material': roof_material,
        'has_electricity': has_electricity,
        'has_piped_water': has_piped_water,
        'has_indoor_toilet': has_indoor_toilet,
        'has_kitchen': has_kitchen,
        'has_parking': has_parking,
        'distance_to_town_km': distance_to_town_km,
        'road_access': road_access
    }


def calculate_rent(features, sector, urban_classification, is_near_lake):
    """
    Calculate monthly rent based on features using Rwanda-specific pricing logic
    Calibrated for Nyamasheke District (Lake Kivu region)
    """
    
    # Base rent by urban classification
    if urban_classification == 'urban':
        base_rent = 80000
    elif urban_classification == 'peri_urban':
        base_rent = 40000
    else:  # rural
        base_rent = 18000
    
    # Bedroom multiplier
    bedroom_multiplier = 1 + (features['num_bedrooms'] - 1) * 0.30
    
    # Floor area contribution (per sqm)
    area_contribution = features['floor_area_sqm'] * 180
    
    # Material quality adjustments
    wall_quality = {'concrete': 1.35, 'brick': 1.20, 'mixed': 1.05, 'mud_brick': 0.90, 'wood': 0.85}
    floor_quality = {'tiles': 1.25, 'cement': 1.10, 'wood': 1.05, 'earth': 0.85}
    roof_quality = {'concrete': 1.30, 'tiles': 1.20, 'iron_sheet': 1.00, 'grass': 0.75}
    
    material_factor = (
        wall_quality.get(features['wall_material'], 1.0) *
        floor_quality.get(features['floor_material'], 1.0) *
        roof_quality.get(features['roof_material'], 1.0)
    ) / 3
    
    # Utilities premium (very important in rural Rwanda)
    utility_bonus = 0
    if features['has_electricity']:
        utility_bonus += 12000 if urban_classification == 'rural' else 6000
    if features['has_piped_water']:
        utility_bonus += 8000 if urban_classification == 'rural' else 4000
    if features['has_indoor_toilet']:
        utility_bonus += 5000
    if features['has_kitchen']:
        utility_bonus += 3000
    if features['has_parking']:
        utility_bonus += 4000
    
    # Distance penalty (further = cheaper)
    distance_penalty = features['distance_to_town_km'] * -800
    
    # Road access premium
    road_premium = {'tarmac': 8000, 'murram': 3000, 'footpath': 0}
    road_bonus = road_premium.get(features['road_access'], 0)
    
    # Lake Kivu proximity premium (tourism boost)
    lake_bonus = 10000 if is_near_lake else 0
    
    # House type adjustment
    house_type_factor = {
        'villa': 1.60,
        'duplex': 1.25,
        'apartment': 1.15,
        'standalone': 1.00,
        'shared_compound': 0.80
    }
    
    # Calculate final rent
    rent = (
        (base_rent * bedroom_multiplier * material_factor * house_type_factor.get(features['house_type'], 1.0)) +
        area_contribution +
        utility_bonus +
        distance_penalty +
        road_bonus +
        lake_bonus
    )
    
    # Add realistic noise
    noise = np.random.uniform(0.90, 1.10)
    rent = rent * noise
    
    # Floor to reasonable values
    min_rent = 8000
    max_rent = 600000
    rent = max(min_rent, min(max_rent, rent))
    
    return round(rent, -2)  # Round to nearest 100


def generate_nyamasheke_dataset(n_samples=2000):
    """Generate complete synthetic dataset for Nyamasheke District"""
    
    data = []
    
    for i in range(n_samples):
        # Select sector (weighted for Kanjuongo focus)
        sector = np.random.choice(
            list(NYAMASHEKE_SECTORS.keys()),
            p=list(NYAMASHEKE_SECTORS.values())
        )
        
        # Urban/rural classification
        urban_classification = np.random.choice(URBAN_RURAL_DIST, p=URBAN_RURAL_WEIGHTS)
        
        # Lake proximity (higher for certain sectors)
        lake_proximity_prob = {
            'Kanjuongo': 0.40,
            'Kagano': 0.35,
            'Cyato': 0.25,
            'Kibogora': 0.15,
            'Nkanka': 0.20,
            'Mahembe': 0.10,
            'Shangi': 0.05
        }
        is_near_lake = np.random.choice([0, 1], p=[
            1 - lake_proximity_prob[sector],
            lake_proximity_prob[sector]
        ])
        
        # Generate property features
        features = generate_property_features(urban_classification, sector, is_near_lake)
        
        # Calculate rent
        monthly_rent_rwf = calculate_rent(features, sector, urban_classification, is_near_lake)
        
        # Compile record
        record = {
            'district': 'Nyamasheke',
            'sector': sector,
            'urban_rural': urban_classification,
            'is_near_lake': is_near_lake,
            **features,
            'monthly_rent_rwf': monthly_rent_rwf
        }
        
        data.append(record)
    
    df = pd.DataFrame(data)
    
    # Add metadata
    df['data_source'] = 'synthetic'
    df['generated_date'] = datetime.now().strftime('%Y-%m-%d')
    
    return df


def save_dataset(df, output_path='data/nyamasheke_housing_data.csv'):
    """Save dataset with summary statistics"""
    
    # Save to CSV
    df.to_csv(output_path, index=False)
    print(f"✅ Dataset saved to {output_path}")
    print(f"📊 Total records: {len(df)}")
    
    # Print summary statistics
    print("\n" + "="*60)
    print("NYAMASHEKE HOUSING DATASET SUMMARY")
    print("="*60)
    
    print(f"\n📍 Sector Distribution:")
    print(df['sector'].value_counts())
    
    print(f"\n🏘️  Urban/Rural Distribution:")
    print(df['urban_rural'].value_counts())
    
    print(f"\n💰 Rent Statistics (RWF):")
    print(df['monthly_rent_rwf'].describe())
    
    print(f"\n🏠 Average Rent by Sector:")
    print(df.groupby('sector')['monthly_rent_rwf'].mean().sort_values(ascending=False).round(0))
    
    print(f"\n🌊 Lake Proximity Impact:")
    print(df.groupby('is_near_lake')['monthly_rent_rwf'].mean().round(0))
    
    print(f"\n⚡ Electricity Impact:")
    print(df.groupby('has_electricity')['monthly_rent_rwf'].mean().round(0))
    
    print("\n" + "="*60)


if __name__ == "__main__":
    # Generate dataset
    print("🇷🇼 Generating Nyamasheke District Housing Dataset...")
    print("🎯 Focus: Kanjuongo Sector\n")
    
    df = generate_nyamasheke_dataset(n_samples=2000)
    
    # Create data directory if needed
    import os
    os.makedirs('data', exist_ok=True)
    
    # Save dataset
    save_dataset(df)
    
    print("\n✅ Data generation complete!")

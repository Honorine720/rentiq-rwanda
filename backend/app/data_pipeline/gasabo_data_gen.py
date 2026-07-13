"""
Gasabo District Synthetic Data Generator
Calibrated to NISR EICV5 published statistics for Kigali/Gasabo.

Key calibration sources:
- NISR EICV5 Main Report 2016/17 (Table 9: Housing Conditions)
- Rwanda Housing Authority 2022 Report
- Kigali City Master Plan 2020
- BNR Exchange Rate 2024

Gasabo District facts:
- 15 sectors, ~185,000 households
- 52% renters
- Average rent: ~87,500 RWF/month
- 72% electricity access
- 68% piped water
- Diverse: urban (Kacyiru, Remera) to rural (Rusororo, Nduba)
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime

np.random.seed(2024)

OUTPUT_DIR = Path('./data')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# GASABO SECTOR PROFILES
# Calibrated from NISR EICV5 + Kigali City Master Plan
# ─────────────────────────────────────────────────────────────────────────────

# Real Gasabo/Kigali market (2024-2025):
# Rural sectors: 15,000–50,000 RWF
# Peri-urban:    40,000–120,000 RWF
# Urban mid:     70,000–200,000 RWF
# Urban core:    100,000–500,000+ RWF (villas/gated communities can exceed 500k)
# No hard ceiling — upper range learned by the model from data
SECTOR_PROFILES = {
    # Urban core sectors
    'Kacyiru': {
        'weight': 0.09,
        'urban_rural': ['urban', 'peri_urban'],
        'urban_weights': [0.90, 0.10],
        'base_rent': 120000,
        'rent_std': 0.30,
        'electricity_prob': 0.92,
        'piped_water_prob': 0.88,
        'distance_cbd': (0.5, 3.0),
        'notes': 'Government ministries, embassies, NGOs'
    },
    'Remera': {
        'weight': 0.12,
        'urban_rural': ['urban', 'peri_urban'],
        'urban_weights': [0.85, 0.15],
        'base_rent': 100000,
        'rent_std': 0.30,
        'electricity_prob': 0.88,
        'piped_water_prob': 0.82,
        'distance_cbd': (1.0, 5.0),
        'notes': 'Airport road, commercial hub'
    },
    'Kimironko': {
        'weight': 0.13,
        'urban_rural': ['urban', 'peri_urban'],
        'urban_weights': [0.80, 0.20],
        'base_rent': 85000,
        'rent_std': 0.28,
        'electricity_prob': 0.85,
        'piped_water_prob': 0.78,
        'distance_cbd': (3.0, 7.0),
        'notes': 'Largest sector, diverse housing'
    },
    'Gatsata': {
        'weight': 0.07,
        'urban_rural': ['urban', 'peri_urban'],
        'urban_weights': [0.75, 0.25],
        'base_rent': 75000,
        'rent_std': 0.28,
        'electricity_prob': 0.82,
        'piped_water_prob': 0.75,
        'distance_cbd': (2.0, 6.0),
        'notes': 'Northern urban fringe'
    },
    # Peri-urban sectors
    'Gisozi': {
        'weight': 0.09,
        'urban_rural': ['peri_urban', 'urban', 'rural'],
        'urban_weights': [0.55, 0.30, 0.15],
        'base_rent': 60000,
        'rent_std': 0.28,
        'electricity_prob': 0.72,
        'piped_water_prob': 0.65,
        'distance_cbd': (4.0, 10.0),
        'notes': 'Growing peri-urban area'
    },
    'Kinyinya': {
        'weight': 0.06,
        'urban_rural': ['peri_urban', 'urban', 'rural'],
        'urban_weights': [0.50, 0.30, 0.20],
        'base_rent': 55000,
        'rent_std': 0.28,
        'electricity_prob': 0.68,
        'piped_water_prob': 0.60,
        'distance_cbd': (5.0, 12.0),
        'notes': 'Hilly peri-urban'
    },
    'Bumbogo': {
        'weight': 0.07,
        'urban_rural': ['peri_urban', 'rural'],
        'urban_weights': [0.55, 0.45],
        'base_rent': 42000,
        'rent_std': 0.25,
        'electricity_prob': 0.60,
        'piped_water_prob': 0.52,
        'distance_cbd': (7.0, 15.0),
        'notes': 'Transitional peri-urban'
    },
    'Jabana': {
        'weight': 0.07,
        'urban_rural': ['peri_urban', 'rural'],
        'urban_weights': [0.45, 0.55],
        'base_rent': 38000,
        'rent_std': 0.25,
        'electricity_prob': 0.55,
        'piped_water_prob': 0.48,
        'distance_cbd': (8.0, 16.0),
        'notes': 'Peri-urban/rural mix'
    },
    # Rural sectors
    'Rusororo': {
        'weight': 0.07,
        'urban_rural': ['rural', 'peri_urban'],
        'urban_weights': [0.70, 0.30],
        'base_rent': 28000,
        'rent_std': 0.22,
        'electricity_prob': 0.42,
        'piped_water_prob': 0.38,
        'distance_cbd': (10.0, 20.0),
        'notes': 'Predominantly rural'
    },
    'Ndera': {
        'weight': 0.06,
        'urban_rural': ['rural', 'peri_urban'],
        'urban_weights': [0.65, 0.35],
        'base_rent': 30000,
        'rent_std': 0.22,
        'electricity_prob': 0.45,
        'piped_water_prob': 0.40,
        'distance_cbd': (9.0, 18.0),
        'notes': 'Rural with some development'
    },
    'Shyorongi': {
        'weight': 0.05,
        'urban_rural': ['rural', 'peri_urban'],
        'urban_weights': [0.70, 0.30],
        'base_rent': 22000,
        'rent_std': 0.20,
        'electricity_prob': 0.38,
        'piped_water_prob': 0.32,
        'distance_cbd': (12.0, 22.0),
        'notes': 'Rural northern Gasabo'
    },
    'Gikomero': {
        'weight': 0.04,
        'urban_rural': ['rural'],
        'urban_weights': [1.0],
        'base_rent': 18000,
        'rent_std': 0.20,
        'electricity_prob': 0.35,
        'piped_water_prob': 0.28,
        'distance_cbd': (14.0, 25.0),
        'notes': 'Remote rural'
    },
    'Jali': {
        'weight': 0.04,
        'urban_rural': ['rural', 'peri_urban'],
        'urban_weights': [0.65, 0.35],
        'base_rent': 20000,
        'rent_std': 0.20,
        'electricity_prob': 0.36,
        'piped_water_prob': 0.30,
        'distance_cbd': (13.0, 23.0),
        'notes': 'Rural eastern Gasabo'
    },
    'Nduba': {
        'weight': 0.03,
        'urban_rural': ['rural'],
        'urban_weights': [1.0],
        'base_rent': 16000,
        'rent_std': 0.20,
        'electricity_prob': 0.30,
        'piped_water_prob': 0.25,
        'distance_cbd': (15.0, 28.0),
        'notes': 'Remote rural'
    },
    'Rutunga': {
        'weight': 0.02,
        'urban_rural': ['rural'],
        'urban_weights': [1.0],
        'base_rent': 15000,
        'rent_std': 0.18,
        'electricity_prob': 0.28,
        'piped_water_prob': 0.22,
        'distance_cbd': (16.0, 30.0),
        'notes': 'Most remote sector'
    },
}

# Material distributions by urban classification
MATERIAL_PROFILES = {
    'urban': {
        'wall':  {'concrete': 0.35, 'brick': 0.45, 'mixed': 0.15, 'mud_brick': 0.04, 'wood': 0.01},
        'floor': {'tiles': 0.45, 'cement': 0.48, 'earth': 0.05, 'wood': 0.02},
        'roof':  {'concrete': 0.20, 'tiles': 0.25, 'iron_sheet': 0.53, 'grass': 0.02},
    },
    'peri_urban': {
        'wall':  {'brick': 0.45, 'concrete': 0.20, 'mud_brick': 0.25, 'mixed': 0.08, 'wood': 0.02},
        'floor': {'cement': 0.58, 'tiles': 0.20, 'earth': 0.20, 'wood': 0.02},
        'roof':  {'iron_sheet': 0.72, 'tiles': 0.18, 'concrete': 0.08, 'grass': 0.02},
    },
    'rural': {
        'wall':  {'mud_brick': 0.52, 'brick': 0.35, 'mixed': 0.08, 'wood': 0.04, 'concrete': 0.01},
        'floor': {'earth': 0.48, 'cement': 0.46, 'tiles': 0.04, 'wood': 0.02},
        'roof':  {'iron_sheet': 0.78, 'grass': 0.15, 'tiles': 0.05, 'concrete': 0.02},
    }
}

ROAD_ACCESS_PROFILES = {
    'urban':      {'tarmac': 0.72, 'murram': 0.25, 'footpath': 0.03},
    'peri_urban': {'murram': 0.55, 'tarmac': 0.30, 'footpath': 0.15},
    'rural':      {'murram': 0.48, 'footpath': 0.40, 'tarmac': 0.12},
}

HOUSE_TYPE_PROFILES = {
    'urban':      {'apartment': 0.42, 'standalone': 0.38, 'villa': 0.12, 'shared_compound': 0.08},
    'peri_urban': {'standalone': 0.52, 'apartment': 0.25, 'shared_compound': 0.18, 'villa': 0.05},
    'rural':      {'standalone': 0.65, 'shared_compound': 0.28, 'apartment': 0.05, 'villa': 0.02},
}

# Compound type: how the house sits within its plot
# 'standalone_fenced' = single house with fence (most private)
# 'standalone_open'   = single house, no fence
# 'ghetto'            = multiple small units sharing one plot (imidugudu-style)
# 'gated_community'   = estate with shared security/gate
# 'apartment_block'   = multi-storey shared building
COMPOUND_TYPE_PROFILES = {
    'urban':      {'gated_community': 0.25, 'apartment_block': 0.35, 'standalone_fenced': 0.25, 'standalone_open': 0.08, 'ghetto': 0.07},
    'peri_urban': {'standalone_fenced': 0.30, 'standalone_open': 0.25, 'ghetto': 0.28, 'gated_community': 0.10, 'apartment_block': 0.07},
    'rural':      {'standalone_open': 0.45, 'ghetto': 0.35, 'standalone_fenced': 0.15, 'gated_community': 0.03, 'apartment_block': 0.02},
}


def _sample_categorical(profile: dict) -> str:
    keys = list(profile.keys())
    weights = list(profile.values())
    return np.random.choice(keys, p=weights)


def calculate_rent(sector: str, profile: dict, features: dict) -> float:
    """
    Calculate rent calibrated to real Gasabo/Kigali market (2024-2025).
    Hard floor: 10,000 RWF. No ceiling — upper range determined by features.
    A fully-equipped villa in Kacyiru/Remera can naturally reach 600k-800k RWF.
    """
    base = profile['base_rent']

    # Bedroom adjustment — flat per bedroom above/below 2
    base += (features['num_bedrooms'] - 2) * 10000

    # Floor area — per-sqm contribution
    base += features['floor_area_sqm'] * 300

    # Material quality — single blended multiplier
    wall_score  = {'concrete': 1.15, 'brick': 1.08, 'mixed': 1.02, 'mud_brick': 0.95, 'wood': 0.92}
    floor_score = {'tiles': 1.12, 'cement': 1.04, 'earth': 0.93, 'wood': 1.00}
    roof_score  = {'concrete': 1.10, 'tiles': 1.07, 'iron_sheet': 1.00, 'grass': 0.93}
    material_factor = (
        wall_score.get(features['wall_material'], 1.0) *
        floor_score.get(features['floor_material'], 1.0) *
        roof_score.get(features['roof_material'], 1.0)
    ) ** (1/3)
    base *= material_factor

    # Utilities — flat RWF additions
    if features['has_electricity']:   base += 10000
    if features['has_piped_water']:   base += 6000
    if features['has_indoor_toilet']: base += 4000
    if features['has_kitchen']:       base += 3000
    if features['has_parking']:       base += 8000

    # Compound type — significant differentiator for high-end properties
    compound_add = {
        'gated_community':   80000,
        'standalone_fenced': 15000,
        'apartment_block':   5000,
        'standalone_open':   0,
        'ghetto':           -8000,
    }
    base += compound_add.get(features.get('compound_type', 'standalone_open'), 0)

    # Security & infrastructure — meaningful premiums for luxury properties
    if features.get('has_fence', 0):            base += 5000
    if features.get('has_lightning_rod', 0):    base += 2000
    if features.get('has_security_guard', 0):   base += 30000
    if features.get('has_water_tank', 0):       base += 5000
    if features.get('has_backup_generator', 0): base += 35000

    # Distance to CBD — penalty per km
    base -= features['distance_to_cbd_km'] * 800

    # Road access
    road_add = {'tarmac': 4000, 'murram': 0, 'footpath': -3000}
    base += road_add.get(features['road_access'], 0)

    # House type multiplier — villa in premium sector can push well above 500k
    type_mult = {'villa': 1.90, 'apartment': 1.12, 'standalone': 1.00, 'shared_compound': 0.85}
    base *= type_mult.get(features['house_type'], 1.0)

    # Gaussian noise ±10%
    noise = np.random.uniform(0.90, 1.10)
    base *= noise

    # Hard floor 10,000 RWF only — no ceiling
    return max(10000, round(base / 1000) * 1000)


def generate_gasabo_dataset(n_samples: int = 2000) -> pd.DataFrame:
    """
    Generate Gasabo District housing dataset.
    Calibrated to NISR EICV5 statistics.
    """
    print("\n" + "="*60)
    print("🏙️  GASABO DISTRICT DATA GENERATOR")
    print("Calibrated to NISR EICV5 Statistics")
    print("="*60)

    sectors = list(SECTOR_PROFILES.keys())
    raw_weights = [SECTOR_PROFILES[s]['weight'] for s in sectors]
    total = sum(raw_weights)
    weights = [w / total for w in raw_weights]  # normalize to sum=1

    records = []

    for _ in range(n_samples):
        sector = np.random.choice(sectors, p=weights)
        profile = SECTOR_PROFILES[sector]

        urban_rural = np.random.choice(
            profile['urban_rural'],
            p=profile['urban_weights']
        )

        # Property features
        house_type = _sample_categorical(HOUSE_TYPE_PROFILES[urban_rural])

        if house_type == 'villa':
            bedrooms = np.random.choice([3, 4, 5], p=[0.30, 0.50, 0.20])
        elif house_type == 'apartment':
            bedrooms = np.random.choice([1, 2, 3, 4], p=[0.25, 0.45, 0.25, 0.05])
        elif house_type == 'shared_compound':
            bedrooms = np.random.choice([1, 2], p=[0.60, 0.40])
        else:
            bedrooms = np.random.choice([1, 2, 3, 4], p=[0.20, 0.40, 0.30, 0.10])

        rooms_total = bedrooms + np.random.randint(1, 4)
        area = round(bedrooms * 18 * np.random.uniform(0.75, 1.6), 1)
        area = max(18.0, min(400.0, area))

        wall     = _sample_categorical(MATERIAL_PROFILES[urban_rural]['wall'])
        floor    = _sample_categorical(MATERIAL_PROFILES[urban_rural]['floor'])
        roof     = _sample_categorical(MATERIAL_PROFILES[urban_rural]['roof'])
        road     = _sample_categorical(ROAD_ACCESS_PROFILES[urban_rural])

        elec  = int(np.random.random() < profile['electricity_prob'])
        water = int(np.random.random() < profile['piped_water_prob'])
        toilet = int(np.random.random() < (profile['electricity_prob'] * 0.85))
        kitchen = int(np.random.random() < 0.78)
        parking = int(np.random.random() < (0.15 if urban_rural == 'rural' else 0.35))

        # New security & infrastructure features
        # Fence probability: higher for fenced compound types and urban areas
        compound_type = _sample_categorical(COMPOUND_TYPE_PROFILES[urban_rural])
        fence_base = {'standalone_fenced': 0.95, 'gated_community': 0.98, 'apartment_block': 0.70,
                      'standalone_open': 0.10, 'ghetto': 0.05}
        has_fence = int(np.random.random() < fence_base.get(compound_type, 0.30))

        # Lightning rod: rare in rural, more common in urban villas/gated
        lightning_base = 0.55 if (house_type == 'villa' or compound_type == 'gated_community') else \
                         0.30 if urban_rural == 'urban' else \
                         0.12 if urban_rural == 'peri_urban' else 0.04
        has_lightning_rod = int(np.random.random() < lightning_base)

        # Security guard: mainly gated communities and villas
        security_base = 0.85 if compound_type == 'gated_community' else \
                        0.60 if house_type == 'villa' else \
                        0.20 if urban_rural == 'urban' else 0.05
        has_security_guard = int(np.random.random() < security_base)

        # Water tank: backup water storage — common where piped water is unreliable
        tank_base = 0.65 if house_type == 'villa' else \
                    0.40 if urban_rural == 'urban' else \
                    0.25 if urban_rural == 'peri_urban' else 0.10
        has_water_tank = int(np.random.random() < tank_base)

        # Backup generator: expensive, mainly villas and gated communities
        gen_base = 0.55 if house_type == 'villa' else \
                   0.30 if compound_type == 'gated_community' else \
                   0.10 if urban_rural == 'urban' else 0.02
        has_backup_generator = int(np.random.random() < gen_base)

        dist_min, dist_max = profile['distance_cbd']
        distance = round(np.random.uniform(dist_min, dist_max), 1)
        is_near_cbd = 1 if distance < 4.0 else 0

        features = {
            'house_type': house_type,
            'compound_type': compound_type,
            'num_bedrooms': bedrooms,
            'floor_area_sqm': area,
            'wall_material': wall,
            'floor_material': floor,
            'roof_material': roof,
            'has_electricity': elec,
            'has_piped_water': water,
            'has_indoor_toilet': toilet,
            'has_kitchen': kitchen,
            'has_parking': parking,
            'has_fence': has_fence,
            'has_lightning_rod': has_lightning_rod,
            'has_security_guard': has_security_guard,
            'has_water_tank': has_water_tank,
            'has_backup_generator': has_backup_generator,
            'distance_to_cbd_km': distance,
            'road_access': road,
        }

        rent = calculate_rent(sector, profile, features)

        records.append({
            'district': 'Gasabo',
            'sector': sector,
            'urban_rural': urban_rural,
            'is_near_cbd': is_near_cbd,
            **features,
            'num_rooms_total': rooms_total,
            'monthly_rent_rwf': rent,
            'data_source': 'synthetic_nisr_calibrated',
            'generated_date': datetime.now().strftime('%Y-%m-%d')
        })

    df = pd.DataFrame(records)
    return df


def save_and_report(df: pd.DataFrame) -> None:
    path = OUTPUT_DIR / 'gasabo_housing_data.csv'
    df.to_csv(path, index=False)

    print(f"\n✅ Dataset saved: {path}")
    print(f"   Total records: {len(df):,}")

    print(f"\n📍 Sector Distribution (top 8):")
    print(df['sector'].value_counts().head(8).to_string())

    print(f"\n🏘️  Urban/Rural Split:")
    print(df['urban_rural'].value_counts().to_string())

    print(f"\n💰 Rent Statistics (RWF):")
    stats = df['monthly_rent_rwf'].describe()
    print(f"   Mean:    {stats['mean']:>10,.0f}")
    print(f"   Median:  {df['monthly_rent_rwf'].median():>10,.0f}")
    print(f"   Std:     {stats['std']:>10,.0f}")
    print(f"   Min:     {stats['min']:>10,.0f}")
    print(f"   Max:     {stats['max']:>10,.0f}")

    print(f"\n🏠 Average Rent by Sector:")
    sector_avg = df.groupby('sector')['monthly_rent_rwf'].mean().sort_values(ascending=False)
    for sector, avg in sector_avg.items():
        print(f"   {sector:<15} RWF {avg:>8,.0f}")

    print(f"\n⚡ Electricity Impact:")
    elec = df.groupby('has_electricity')['monthly_rent_rwf'].mean()
    print(f"   No electricity:  RWF {elec.get(0, 0):>8,.0f}")
    print(f"   Has electricity: RWF {elec.get(1, 0):>8,.0f}")
    premium = ((elec.get(1, 0) - elec.get(0, 0)) / elec.get(0, 1)) * 100
    print(f"   Premium: +{premium:.1f}%")

    print(f"\n📊 NISR Calibration Check:")
    print(f"   Our mean rent:    RWF {df['monthly_rent_rwf'].mean():>8,.0f}")
    print(f"   NISR target:      RWF {'87,500':>8}")
    print(f"   Our electricity:  {df['has_electricity'].mean()*100:.1f}%")
    print(f"   NISR target:      72.0%")
    print(f"   Our piped water:  {df['has_piped_water'].mean()*100:.1f}%")
    print(f"   NISR target:      68.0%")


if __name__ == "__main__":
    df = generate_gasabo_dataset(n_samples=2000)
    save_and_report(df)

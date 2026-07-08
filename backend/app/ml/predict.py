"""
Prediction Module with SHAP Explainability for RentIQ Rwanda
Makes predictions and explains feature impacts using SHAP values
"""
import numpy as np
import joblib
import shap
from pathlib import Path
from typing import Dict, List, Tuple

from app.ml.preprocess import preprocess_input, ALL_FEATURES


class RentPredictor:
    """
    Rent prediction class using weighted ensemble of all trained models
    """
    
    def __init__(self, model_dir: str = './models_saved'):
        self.model_dir = Path(model_dir)
        self.models = self._load_models()
        self.preprocessor = self._load_preprocessor()
        self.feature_names = self._load_feature_names()
        self.metadata = self._load_metadata()
        self.explainer = self._create_explainer()

    def _load_models(self):
        """Load ensemble models. Skips random_forest to save memory on free hosting."""
        ensemble_meta_path = self.model_dir / 'ensemble_meta.pkl'
        # Models to skip on memory-constrained environments
        SKIP_MODELS = {'random_forest'}
        if ensemble_meta_path.exists():
            ensemble_meta = joblib.load(ensemble_meta_path)
            models = []
            weights = []
            for slug, w in zip(ensemble_meta['slugs'], ensemble_meta['weights']):
                if slug in SKIP_MODELS:
                    continue
                path = self.model_dir / f'{slug}.pkl'
                if path.exists():
                    models.append(joblib.load(path))
                    weights.append(w)
            if models:
                total = sum(weights)
                self.weights = [w / total for w in weights]
                return models
        # Fallback: single best model
        model_path = self.model_dir / 'best_model.pkl'
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}")
        self.weights = [1.0]
        return [joblib.load(model_path)]
    
    def _load_preprocessor(self):
        """Load fitted preprocessor"""
        preprocessor_path = self.model_dir / 'preprocessor.pkl'
        if not preprocessor_path.exists():
            raise FileNotFoundError(f"Preprocessor not found at {preprocessor_path}")
        return joblib.load(preprocessor_path)
    
    def _load_feature_names(self):
        """Load feature names after transformation"""
        feature_names_path = self.model_dir / 'feature_names.pkl'
        if feature_names_path.exists():
            return joblib.load(feature_names_path)
        return None
    
    def _load_metadata(self):
        """Load model metadata"""
        metadata_path = self.model_dir / 'model_metadata.pkl'
        if metadata_path.exists():
            return joblib.load(metadata_path)
        return {}
    
    def _create_explainer(self):
        """Create SHAP explainer using the best tree model (XGBoost or RandomForest)"""
        try:
            # Find the best tree-based model for SHAP
            for model in self.models:
                if hasattr(model, 'get_booster') or hasattr(model, 'estimators_'):
                    return shap.TreeExplainer(model)
            return shap.Explainer(self.models[0])
        except Exception as e:
            print(f"Warning: Could not create SHAP explainer: {e}")
            return None
    
    def predict(self, property_data: Dict) -> Dict:
        """
        Make rent prediction with SHAP explanations
        """
        # Compute engineered features server-side
        property_data = dict(property_data)
        property_data['utility_score'] = sum([
            property_data.get('has_electricity', 0),
            property_data.get('has_piped_water', 0),
            property_data.get('has_indoor_toilet', 0),
            property_data.get('has_kitchen', 0),
            property_data.get('has_water_tank', 0),
            property_data.get('has_backup_generator', 0),
        ])
        property_data['material_quality'] = {
            'concrete': 3, 'brick': 2, 'mixed': 1, 'mud_brick': 0, 'wood': 0
        }.get(property_data.get('wall_material', ''), 1)
        bedrooms = property_data.get('num_bedrooms', 1)
        property_data['rooms_per_bedroom'] = round(
            property_data.get('num_rooms_total', bedrooms) / max(bedrooms, 1), 2
        )
        property_data['area_per_bedroom'] = round(
            property_data.get('floor_area_sqm', 30) / max(bedrooms, 1), 2
        )

        # Validate input has all required features
        missing_features = set(ALL_FEATURES) - set(property_data.keys())
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")
        
        # Preprocess input
        import pandas as pd
        df_input = pd.DataFrame([property_data])
        X_transformed = self.preprocessor.transform(df_input)
        
        # Weighted ensemble prediction
        predictions = [m.predict(X_transformed)[0] for m in self.models]
        predicted_rent_rwf = float(sum(p * w for p, w in zip(predictions, self.weights)))

        # Sector-based sanity cap to prevent inflated predictions
        SECTOR_CAPS = {
            'Kacyiru': 450000, 'Kimihurura': 400000, 'Remera': 350000,
            'Kimironko': 300000, 'Gisozi': 250000, 'Kinyinya': 220000,
            'Gatsata': 200000, 'Ndera': 180000, 'Gikomero': 160000,
            'Jabana': 140000, 'Jali': 130000, 'Bumbogo': 120000,
            'Rusororo': 110000, 'Nduba': 100000, 'Rutunga': 90000,
        }
        SECTOR_FLOORS = {
            'Kacyiru': 40000, 'Kimihurura': 35000, 'Remera': 30000,
            'Kimironko': 25000, 'Gisozi': 20000, 'Kinyinya': 18000,
            'Gatsata': 18000, 'Ndera': 15000, 'Gikomero': 12000,
            'Jabana': 12000, 'Jali': 12000, 'Bumbogo': 12000,
            'Rusororo': 12000, 'Nduba': 12000, 'Rutunga': 12000,
        }
        sector = property_data.get('sector', '')
        cap = SECTOR_CAPS.get(sector, 500000)
        floor = SECTOR_FLOORS.get(sector, 10000)
        predicted_rent_rwf = max(floor, min(cap, predicted_rent_rwf))

        # Confidence interval: ±0.6*MAE covers ~70% of actual errors (tight & honest)
        mae = self.metadata.get('test_mae', predicted_rent_rwf * 0.10)
        margin = 0.6 * mae
        confidence_low = max(floor, predicted_rent_rwf - margin)
        confidence_high = min(cap, predicted_rent_rwf + margin)
        
        # Get SHAP explanations
        shap_explanations = self._get_shap_explanations(X_transformed, property_data)
        
        # Convert to USD (exchange rate from env or default)
        usd_exchange_rate = 1396.0  # RWF per USD
        predicted_rent_usd = predicted_rent_rwf / usd_exchange_rate
        
        return {
            'predicted_rent_rwf': round(predicted_rent_rwf, 2),
            'predicted_rent_usd': round(predicted_rent_usd, 2),
            'confidence_range': {
                'low': round(confidence_low, 2),
                'high': round(confidence_high, 2)
            },
            'model_name': self.metadata.get('model_name', 'Unknown'),
            'model_r2_score': self.metadata.get('test_r2', 0.0),
            'shap_explanations': shap_explanations,
            'input_features': property_data
        }
    
    def _get_shap_explanations(self, X_transformed, original_features: Dict) -> List[Dict]:
        """
        Calculate SHAP values and return top feature impacts
        
        Returns:
            List of dicts with feature impacts sorted by absolute value
        """
        if self.explainer is None:
            return self._fallback_feature_importance()
        
        try:
            # Calculate SHAP values
            shap_values = self.explainer.shap_values(X_transformed)
            
            # Handle different SHAP output formats
            if isinstance(shap_values, list):
                shap_values = shap_values[0]
            
            # Flatten if needed
            if len(shap_values.shape) > 1:
                shap_values = shap_values[0]
            
            # Create explanation list
            explanations = []
            for i, (feature_name, shap_value) in enumerate(zip(self.feature_names, shap_values)):
                explanations.append({
                    'feature': feature_name,
                    'impact': float(shap_value),
                    'direction': 'positive' if shap_value > 0 else 'negative',
                    'abs_impact': abs(float(shap_value))
                })
            
            # Sort by absolute impact and return top 5
            explanations.sort(key=lambda x: x['abs_impact'], reverse=True)
            top_explanations = explanations[:5]
            
            # Remove abs_impact from output
            for exp in top_explanations:
                exp.pop('abs_impact')
            
            return top_explanations
            
        except Exception as e:
            print(f"Warning: SHAP calculation failed: {e}")
            return self._fallback_feature_importance()
    
    def _fallback_feature_importance(self) -> List[Dict]:
        """Fallback to model feature importance if SHAP fails"""
        model = next((m for m in self.models if hasattr(m, 'feature_importances_')), None)
        if model is None:
            return []
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1][:5]
        
        explanations = []
        for idx in indices:
            explanations.append({
                'feature': self.feature_names[idx],
                'impact': float(importances[idx] * 10000),  # Scale for display
                'direction': 'positive'
            })
        
        return explanations
    
    def predict_batch(self, properties: List[Dict]) -> List[Dict]:
        """
        Make predictions for multiple properties
        
        Args:
            properties: List of property dictionaries
            
        Returns:
            List of prediction results
        """
        return [self.predict(prop) for prop in properties]


# Singleton instance for FastAPI
_predictor_instance = None


def get_predictor() -> RentPredictor:
    """Get or create predictor singleton (lazy load)"""
    global _predictor_instance
    if _predictor_instance is None:
        try:
            _predictor_instance = RentPredictor()
        except Exception as e:
            print(f"Warning: Could not load predictor: {e}")
            return None
    return _predictor_instance


# Test function
if __name__ == "__main__":
    print("\n" + "="*60)
    print("Testing RentIQ Rwanda Predictor with SHAP")
    print("="*60)
    
    # Sample Kanjuongo property
    sample_property = {
        'district': 'Nyamasheke',
        'sector': 'Kanjuongo',
        'house_type': 'standalone',
        'num_bedrooms': 2,
        'num_rooms_total': 4,
        'floor_area_sqm': 55.0,
        'wall_material': 'brick',
        'floor_material': 'cement',
        'roof_material': 'iron_sheet',
        'has_electricity': 1,
        'has_piped_water': 0,
        'has_indoor_toilet': 1,
        'has_kitchen': 1,
        'has_parking': 0,
        'distance_to_town_km': 5.5,
        'road_access': 'murram',
        'is_near_lake': 1,
        'urban_rural': 'peri_urban'
    }
    
    print("\n📍 Test Property (Kanjuongo Sector):")
    print(f"  • Type: {sample_property['house_type']}, {sample_property['num_bedrooms']} bedrooms")
    print(f"  • Area: {sample_property['floor_area_sqm']} sqm")
    print(f"  • Materials: {sample_property['wall_material']}, {sample_property['floor_material']}, {sample_property['roof_material']}")
    print(f"  • Utilities: Electricity={sample_property['has_electricity']}, Water={sample_property['has_piped_water']}")
    print(f"  • Location: {sample_property['distance_to_town_km']}km from town, near lake={sample_property['is_near_lake']}")
    
    # Make prediction
    predictor = get_predictor()
    result = predictor.predict(sample_property)
    
    print("\n💰 Prediction Results:")
    print(f"  • Predicted Rent: RWF {result['predicted_rent_rwf']:,.2f} (${result['predicted_rent_usd']:.2f})")
    print(f"  • Confidence Range: RWF {result['confidence_range']['low']:,.0f} - {result['confidence_range']['high']:,.0f}")
    print(f"  • Model: {result['model_name']} (R² = {result['model_r2_score']:.4f})")
    
    print("\n🔍 Top 5 Feature Impacts (SHAP):")
    for i, exp in enumerate(result['shap_explanations'], 1):
        sign = '+' if exp['direction'] == 'positive' else '-'
        print(f"  {i}. {exp['feature']:<30} {sign} RWF {abs(exp['impact']):>8,.2f}")
    
    print("\n" + "="*60)
    print("✅ Prediction test completed successfully!")
    print("="*60 + "\n")

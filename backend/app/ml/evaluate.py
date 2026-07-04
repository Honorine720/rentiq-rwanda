"""
Model Evaluation and Visualization for RentIQ Rwanda
Generates residual plots, feature importance charts, and performance metrics
"""
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from app.ml.preprocess import load_preprocessor, ALL_FEATURES, TARGET


def load_model_and_data():
    """Load the trained model, preprocessor, and test data"""
    print("Loading model and data...")
    
    # Load model
    model_path = './models_saved/best_model.pkl'
    model = joblib.load(model_path)
    
    # Load preprocessor
    preprocessor = load_preprocessor('./models_saved/preprocessor.pkl')
    
    # Load metadata
    metadata_path = './models_saved/model_metadata.pkl'
    metadata = joblib.load(metadata_path)
    
    # Load data
    data_path = './data/gasabo_housing_data.csv'
    df = pd.read_csv(data_path)
    
    return model, preprocessor, metadata, df


def calculate_metrics(y_true, y_pred):
    """Calculate comprehensive evaluation metrics"""
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    
    # Mean Absolute Percentage Error (MAPE)
    # Avoid division by zero
    mask = y_true != 0
    mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100
    
    return {
        'MAE': mae,
        'RMSE': rmse,
        'R2': r2,
        'MAPE': mape
    }


def plot_residuals(y_true, y_pred, save_path='./models_saved/residuals.png'):
    """
    Create residual plot: predicted vs actual values
    """
    print("\nGenerating residual plot...")
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Plot 1: Predicted vs Actual
    axes[0].scatter(y_true, y_pred, alpha=0.5, s=20, edgecolors='k', linewidths=0.5)
    
    # Perfect prediction line
    min_val = min(y_true.min(), y_pred.min())
    max_val = max(y_true.max(), y_pred.max())
    axes[0].plot([min_val, max_val], [min_val, max_val], 'r--', linewidth=2, label='Perfect Prediction')
    
    axes[0].set_xlabel('Actual Rent (RWF)', fontsize=11, fontweight='bold')
    axes[0].set_ylabel('Predicted Rent (RWF)', fontsize=11, fontweight='bold')
    axes[0].set_title('Predicted vs Actual Rent Prices', fontsize=13, fontweight='bold')
    axes[0].legend()
    axes[0].grid(alpha=0.3)
    axes[0].ticklabel_format(style='plain', axis='both')
    
    # Plot 2: Residual distribution
    residuals = y_pred - y_true
    axes[1].hist(residuals, bins=50, edgecolor='black', alpha=0.7, color='#1B4332')
    axes[1].axvline(x=0, color='red', linestyle='--', linewidth=2, label='Zero Error')
    axes[1].set_xlabel('Residual (RWF)', fontsize=11, fontweight='bold')
    axes[1].set_ylabel('Frequency', fontsize=11, fontweight='bold')
    axes[1].set_title('Residual Distribution', fontsize=13, fontweight='bold')
    axes[1].legend()
    axes[1].grid(alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"✓ Residual plot saved to: {save_path}")
    plt.close()


def plot_feature_importance(model, feature_names, top_n=15, save_path='./models_saved/feature_importance.png'):
    """
    Create feature importance chart (top N features)
    """
    print("\nGenerating feature importance chart...")
    
    # Get feature importances (works for tree-based models)
    try:
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        elif hasattr(model, 'coef_'):
            # For linear models, use absolute coefficients
            importances = np.abs(model.coef_)
        else:
            print("Model does not support feature importance extraction")
            return
        
        # Create DataFrame
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': importances
        }).sort_values('importance', ascending=False).head(top_n)
        
        # Plot
        fig, ax = plt.subplots(figsize=(10, 8))
        
        colors = ['#1B4332' if importance_df['importance'].iloc[i] > importance_df['importance'].mean() 
                  else '#D4A017' for i in range(len(importance_df))]
        
        ax.barh(importance_df['feature'], importance_df['importance'], color=colors, edgecolor='black', linewidth=0.8)
        ax.set_xlabel('Importance Score', fontsize=12, fontweight='bold')
        ax.set_ylabel('Feature', fontsize=12, fontweight='bold')
        ax.set_title(f'Top {top_n} Most Important Features', fontsize=14, fontweight='bold')
        ax.invert_yaxis()
        ax.grid(axis='x', alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"✓ Feature importance chart saved to: {save_path}")
        plt.close()
        
    except Exception as e:
        print(f"Could not generate feature importance: {e}")


def print_evaluation_report(metrics, metadata):
    """Print a formatted evaluation report"""
    print("\n" + "="*70)
    print("MODEL EVALUATION REPORT - RentIQ Rwanda")
    print("="*70)
    
    print(f"\nModel: {metadata['model_name']}")
    print(f"Training Date: {metadata['training_date']}")
    print(f"\n{'─'*70}")
    print("PERFORMANCE METRICS")
    print(f"{'─'*70}")
    print(f"  R² Score (Coefficient of Determination): {metrics['R2']:.4f}")
    print(f"  Mean Absolute Error (MAE):                RWF {metrics['MAE']:>12,.2f}")
    print(f"  Root Mean Squared Error (RMSE):           RWF {metrics['RMSE']:>12,.2f}")
    print(f"  Mean Absolute Percentage Error (MAPE):    {metrics['MAPE']:>12.2f}%")
    
    print(f"\n{'─'*70}")
    print("INTERPRETATION")
    print(f"{'─'*70}")
    
    # R² interpretation
    if metrics['R2'] >= 0.9:
        r2_quality = "Excellent"
    elif metrics['R2'] >= 0.8:
        r2_quality = "Very Good"
    elif metrics['R2'] >= 0.7:
        r2_quality = "Good"
    elif metrics['R2'] >= 0.6:
        r2_quality = "Moderate"
    else:
        r2_quality = "Poor"
    
    print(f"  • R² Score: {r2_quality}")
    print(f"    The model explains {metrics['R2']*100:.1f}% of variance in rent prices")
    
    # MAE interpretation
    print(f"\n  • Average Prediction Error: RWF {metrics['MAE']:,.0f}")
    print(f"    On average, predictions are off by ~{metrics['MAPE']:.1f}%")
    
    # Confidence interval
    confidence_range = metrics['MAE'] * 1.2
    print(f"\n  • 68% Confidence Range: ± RWF {confidence_range:,.0f}")
    print(f"    Most predictions will fall within this range")
    
    print("\n" + "="*70)


def evaluate_by_district(df, model, preprocessor):
    """Evaluate model performance by district"""
    print("\n" + "─"*70)
    print("PERFORMANCE BY DISTRICT")
    print("─"*70)
    
    X = df[ALL_FEATURES]
    y = df[TARGET]
    X_transformed = preprocessor.transform(X)
    y_pred = model.predict(X_transformed)
    
    df_eval = df.copy()
    df_eval['predicted_rent'] = y_pred
    
    print(f"\n{'District':<15} {'Count':<8} {'Avg Actual':<15} {'Avg Predicted':<15} {'MAE':<12} {'R²':<8}")
    print("─"*70)
    
    for district in df['district'].unique():
        mask = df_eval['district'] == district
        district_actual = df_eval[mask][TARGET]
        district_pred = df_eval[mask]['predicted_rent']
        
        if len(district_actual) > 1:
            mae = mean_absolute_error(district_actual, district_pred)
            r2 = r2_score(district_actual, district_pred)
            
            print(f"{district:<15} {len(district_actual):<8} "
                  f"RWF {district_actual.mean():>8,.0f}   "
                  f"RWF {district_pred.mean():>8,.0f}   "
                  f"RWF {mae:>6,.0f}   {r2:>6.3f}")


def main():
    """Main evaluation pipeline"""
    print("\n" + "="*70)
    print("RentIQ RWANDA - MODEL EVALUATION")
    print("="*70)
    
    # Load model and data
    model, preprocessor, metadata, df = load_model_and_data()
    
    # Prepare data
    X = df[ALL_FEATURES]
    y = df[TARGET]
    
    # Transform and predict
    print("\nTransforming features and generating predictions...")
    X_transformed = preprocessor.transform(X)
    y_pred = model.predict(X_transformed)
    
    # Calculate metrics
    metrics = calculate_metrics(y.values, y_pred)
    
    # Print report
    print_evaluation_report(metrics, metadata)
    
    # Plot residuals
    plot_residuals(y.values, y_pred)
    
    # Plot feature importance
    feature_names = joblib.load('./models_saved/feature_names.pkl')
    plot_feature_importance(model, feature_names)
    
    # District-level evaluation
    evaluate_by_district(df, model, preprocessor)
    
    print("\n" + "="*70)
    print("EVALUATION COMPLETE!")
    print("="*70)
    print("\nGenerated files:")
    print("  • residuals.png - Prediction accuracy visualization")
    print("  • feature_importance.png - Top influential features")
    print("\nNext step: Start the API server")
    print("  → uvicorn app.main:app --reload")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()

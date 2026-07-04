# RentIQ Rwanda 🇷🇼

AI-Powered House Rent Price Prediction for Rwanda with focus on Nyamasheke District.

![RentIQ Rwanda](https://img.shields.io/badge/Rwanda-AI%20Rent%20Prediction-green)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688)

## 🌟 Features

- **Accurate Predictions**: XGBoost model trained on Rwanda housing data
- **Explainable AI**: SHAP values show what influences each prediction
- **Rwanda-Specific**: Districts, sectors, materials calibrated for Rwanda
- **Dual Currency**: Results in both RWF and USD
- **Prediction History**: Track all predictions with export capability
- **Beautiful UI**: Brutalist design with Rwanda flag colors

## 🏗️ Tech Stack

### Backend
- Python 3.11
- FastAPI (REST API)
- XGBoost (ML Model)
- SHAP (Explainability)
- SQLAlchemy (Database)
- Scikit-learn (Preprocessing)

### Frontend
- React 18
- Vite (Build Tool)
- TailwindCSS (Styling)
- React Router (Navigation)
- Axios (HTTP Client)

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd rentiq-rwanda
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train the ML model
python -m app.ml.train

# Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📊 Model Training

The model training pipeline:

1. **Generates synthetic Rwanda housing data** (or uses existing data)
2. **Trains 3 models**: Linear Regression, Random Forest, XGBoost
3. **Compares performance** using cross-validation
4. **Saves the best model** with metadata

To retrain the model:

```bash
cd backend
python -m app.ml.train
```

To evaluate the model:

```bash
python -m app.ml.evaluate
```

## 🎯 API Endpoints

### Health
- `GET /` - Health check with model info
- `GET /health` - Simple health check
- `GET /version` - API and model version

### Predictions
- `POST /api/predict` - Make a single prediction
- `POST /api/predict/batch` - Batch predictions
- `GET /api/predict/examples` - Get example inputs

### History
- `GET /api/history` - Get prediction history
- `GET /api/history/{id}` - Get specific prediction
- `GET /api/history/statistics/summary` - Get statistics
- `GET /api/history/export/csv` - Export to CSV
- `DELETE /api/history/clear` - Clear history (admin)

## 📁 Project Structure

```
rentiq-rwanda/
├── backend/
│   ├── app/
│   │   ├── ml/              # ML training, prediction, preprocessing
│   │   ├── models/          # Database models and schemas
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utilities (logging, etc.)
│   │   └── main.py          # FastAPI app entry point
│   ├── models_saved/        # Trained models (generated)
│   ├── data/                # Training data (generated)
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Page components
    │   ├── services/        # API service layer
    │   ├── App.jsx          # Main app component
    │   └── main.jsx         # Entry point
    ├── package.json         # Node dependencies
    ├── vite.config.js       # Vite configuration
    └── tailwind.config.js   # Tailwind configuration
```

## 🏘️ Supported Districts

- **Nyamasheke** (Primary focus - Lake Kivu region)
- Kigali (Capital city)
- Rubavu (Gisenyi area)
- Musanze (Northern province)
- Huye (Southern province)

## 🔑 Key Property Features (18 total)

- District & Sector
- House Type (standalone, apartment, etc.)
- Number of Bedrooms & Total Rooms
- Floor Area (sqm)
- Construction Materials (wall, floor, roof)
- Utilities (electricity, water, toilet)
- Amenities (kitchen, parking)
- Location (distance to town, road access, near lake)
- Urban/Rural classification

## 📊 Model Performance

The XGBoost model typically achieves:
- **R² Score**: ~0.85-0.95 (on test set)
- **MAE**: ~10,000-15,000 RWF
- **RMSE**: ~15,000-20,000 RWF

Performance metrics are displayed in the API health check and prediction responses.

## 🛠️ Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Formatting

```bash
# Backend (Python)
black app/
isort app/

# Frontend (JavaScript)
npm run lint
```

## 🌐 Deployment

### Backend (FastAPI)

Can be deployed to:
- AWS EC2 / DigitalOcean Droplet
- Heroku
- Google Cloud Run
- Railway

### Frontend (React)

Can be deployed to:
- Vercel (recommended)
- Netlify
- AWS Amplify
- GitHub Pages

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Contact

For questions or issues, please open a GitHub issue.

---

Built with ❤️ for Rwanda 🇷🇼

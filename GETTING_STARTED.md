# 🚀 Getting Started with RentIQ Rwanda

Welcome to RentIQ Rwanda! This guide will help you get the app running in minutes.

## ✅ What You Have

Your project is now complete with:

### Backend (Python/FastAPI)
- ✅ Complete ML pipeline (train.py, predict.py, preprocess.py, evaluate.py)
- ✅ FastAPI REST API with full documentation
- ✅ SHAP-based explainability
- ✅ Database integration with history tracking
- ✅ All dependencies listed in requirements.txt

### Frontend (React/Vite)
- ✅ Beautiful UI with Rwanda flag colors (brutalist design)
- ✅ Multi-step prediction form
- ✅ Results page with SHAP explanations
- ✅ History page
- ✅ About page
- ✅ Fully responsive navigation
- ✅ All dependencies in package.json

### Configuration
- ✅ Environment variables (.env files)
- ✅ Tailwind CSS configuration
- ✅ Vite configuration
- ✅ PostCSS configuration
- ✅ .gitignore

### Documentation
- ✅ README.md (comprehensive)
- ✅ COMMANDS.md (quick reference)
- ✅ Setup script (setup.sh)

## 🎯 Three Ways to Get Started

### Option 1: Automated Setup (Recommended)

```bash
# From the project root
./setup.sh
```

This will:
1. Check prerequisites
2. Set up Python virtual environment
3. Install all Python dependencies
4. Train the ML model
5. Install all Node.js dependencies

### Option 2: Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.ml.train
```

#### Frontend
```bash
cd frontend
npm install
```

### Option 3: Step-by-Step (Beginner-Friendly)

**Step 1: Backend Setup**
```bash
# Navigate to backend folder
cd backend

# Create Python virtual environment
python -m venv venv

# Activate it (choose based on your OS)
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

# Install Python packages
pip install -r requirements.txt

# Train the ML model (takes 1-2 minutes)
python -m app.ml.train
```

**Step 2: Frontend Setup**
```bash
# Open a NEW terminal
cd frontend

# Install Node.js packages
npm install
```

## ▶️ Running the App

You need TWO terminal windows running simultaneously:

### Terminal 1 - Backend API
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Wait for:
```
🇷🇼 RentIQ Rwanda API - Starting Up
✓ Database initialized
✓ Model loaded: XGBoost
🚀 API Server Ready
📖 Documentation: http://localhost:8000/docs
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Wait for:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Access the App

Open your browser to: **http://localhost:3000**

The backend API documentation is at: **http://localhost:8000/docs**

## 🎨 What You Can Do

1. **Home Page** (`/`)
   - Overview of RentIQ Rwanda
   - Features showcase
   - Model status indicator

2. **Predict Page** (`/predict`)
   - 4-step prediction form
   - Input property details
   - Get instant rent predictions
   - View SHAP explanations

3. **History Page** (`/history`)
   - View all past predictions
   - Filter by district
   - See prediction details

4. **About Page** (`/about`)
   - Learn about the technology
   - Understand how it works
   - See supported districts

## 🔍 Testing the App

### Test the Backend API

```bash
# Check health
curl http://localhost:8000/

# Get prediction examples
curl http://localhost:8000/api/predict/examples
```

Or visit: http://localhost:8000/docs for interactive API testing

### Test a Prediction

1. Go to http://localhost:3000/predict
2. Fill in the form:
   - District: Nyamasheke
   - Sector: Kagano
   - House Type: standalone
   - Bedrooms: 3
   - Floor Area: 85 sqm
   - Fill in other required fields
3. Click "Predict Rent"
4. View results with SHAP explanations

## 📊 Understanding the Results

When you make a prediction, you'll see:

- **Predicted Rent**: In both RWF and USD
- **Confidence Range**: The likely range of actual rent
- **Price Tier**: Affordable / Mid-Range / Premium
- **SHAP Explanations**: Top 5 factors influencing the price
- **Model Info**: Which model was used and its accuracy

## 🛠️ Troubleshooting

### "Model not found" error
```bash
cd backend
python -m app.ml.train
```

### "Port already in use" error
```bash
# Backend (port 8000)
lsof -i :8000  # Find process
kill -9 <PID>  # Kill it

# Frontend (port 3000)
lsof -i :3000
kill -9 <PID>
```

### CORS errors in browser
Check your `.env` files:
- `backend/.env` should have: `ALLOWED_ORIGINS=http://localhost:3000`
- `frontend/.env` should have: `VITE_API_URL=http://localhost:8000`

### Frontend not loading
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📚 Next Steps

1. **Explore the API**: Visit http://localhost:8000/docs
2. **Make predictions**: Test different property types
3. **View history**: See all your predictions
4. **Customize**: Modify colors, add features, extend districts
5. **Deploy**: Consider Vercel (frontend) + Railway (backend)

## 🎓 Learning Resources

- FastAPI docs: https://fastapi.tiangolo.com/
- React docs: https://react.dev/
- XGBoost docs: https://xgboost.readthedocs.io/
- SHAP docs: https://shap.readthedocs.io/

## 🤝 Need Help?

- Check `README.md` for comprehensive documentation
- Check `COMMANDS.md` for quick command reference
- Open an issue on GitHub
- Review the inline code comments

---

**Ready to predict house rents in Rwanda? Let's go! 🇷🇼**

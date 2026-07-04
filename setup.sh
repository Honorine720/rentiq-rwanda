#!/bin/bash

echo "=========================================="
echo "🇷🇼 RentIQ Rwanda - Quick Start Guide"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""
echo "=========================================="
echo "📦 Step 1: Backend Setup"
echo "=========================================="
echo ""

cd backend

echo "Creating Python virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "=========================================="
echo "🤖 Step 2: Training ML Model"
echo "=========================================="
echo ""
echo "This will generate synthetic data and train the model..."
python -m app.ml.train

echo ""
echo "=========================================="
echo "✅ Backend Setup Complete!"
echo "=========================================="
echo ""
echo "To start the backend API server, run:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "API will be available at: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""

cd ../frontend

echo "=========================================="
echo "📦 Step 3: Frontend Setup"
echo "=========================================="
echo ""
echo "Installing Node.js dependencies..."
npm install

echo ""
echo "=========================================="
echo "✅ Frontend Setup Complete!"
echo "=========================================="
echo ""
echo "To start the frontend development server, run:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "App will be available at: http://localhost:3000"
echo ""
echo "=========================================="
echo "🚀 Next Steps:"
echo "=========================================="
echo ""
echo "1. Open TWO terminal windows"
echo ""
echo "2. Terminal 1 - Start Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload"
echo ""
echo "3. Terminal 2 - Start Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "=========================================="
echo "✨ Setup Complete! Happy Predicting! 🇷🇼"
echo "=========================================="

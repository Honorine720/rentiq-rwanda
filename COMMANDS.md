# 🇷🇼 RentIQ Rwanda - Quick Command Reference

## First Time Setup

```bash
# Run the automated setup script
./setup.sh
```

## Backend Commands

```bash
cd backend

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Train the ML model
python -m app.ml.train

# Evaluate the model
python -m app.ml.evaluate

# Start API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Commands

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Running the Full App

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Then open: **http://localhost:3000**

## API Endpoints

- API Root: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Redoc: `http://localhost:8000/redoc`

## Project URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows

# Kill process if needed
kill -9 <PID>  # Linux/Mac
```

### Frontend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000  # Linux/Mac

# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Model not found error
```bash
cd backend
python -m app.ml.train
```

### CORS errors
Check that `.env` files are properly configured:
- Backend `.env`: `ALLOWED_ORIGINS=http://localhost:3000`
- Frontend `.env`: `VITE_API_URL=http://localhost:8000`

## Testing

```bash
# Backend tests
cd backend
pytest

# Test single prediction
python -m app.ml.predict
```

## Database

The app uses SQLite by default. Database file: `backend/predictions.db`

To reset the database:
```bash
rm backend/predictions.db
# Restart the backend - it will create a new database
```

## Deployment

### Backend (FastAPI)
- Use Gunicorn for production: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`
- Set `ENV=production` in `.env`

### Frontend (React)
- Build: `npm run build`
- Deploy `dist/` folder to Vercel, Netlify, etc.

## Tips

- Keep both backend and frontend running in separate terminals
- Check API docs at `/docs` for interactive API testing
- Use the History page to see all past predictions
- SHAP explanations show which features matter most

---

Need help? Check the README.md or open an issue!

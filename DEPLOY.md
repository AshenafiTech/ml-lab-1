# Deploy Guide

## Prereqs
- Python 3.11
- Kaggle creds in env: `KAGGLE_USERNAME`, `KAGGLE_KEY` (do not commit)
- Node 18+

## Train & Export
1) In `notebooks/pipeline.ipynb`, run cells end-to-end (requires Kaggle env). Models land in `models/`.

## FastAPI (Render)
1) Build locally: `docker build -t heart-api .`
2) Run locally: `docker run -p 8000:8000 --env KAGGLE_USERNAME --env KAGGLE_KEY heart-api`
3) Deploy on Render:
   - New Web Service from repo, use Dockerfile.
   - Set env vars: `KAGGLE_USERNAME`, `KAGGLE_KEY` (or pre-upload models so no download needed).
   - Expose port 8000.

## Frontend (Vercel)
1) From `frontend/`: `npm install && npm run build`
2) Dev: `npm run dev` (uses `VITE_API_BASE_URL=http://localhost:8000`)
3) Vercel deploy:
   - Project root `frontend/`
   - Build command: `npm run build`
   - Output: `dist`
   - Env var: `VITE_API_BASE_URL=https://<render-service>.onrender.com`

## API Endpoints
- `GET /health`
- `POST /predict/{model}` with body:
```
{
  "Age": 54,
  "Sex": "M",
  "ChestPainType": "ASY",
  "RestingBP": 140,
  "Cholesterol": 239,
  "FastingBS": 0,
  "RestingECG": "Normal",
  "MaxHR": 160,
  "ExerciseAngina": "N",
  "Oldpeak": 1.2,
  "ST_Slope": "Flat"
}
```

## Notes
- Models are bundled into Docker image; update `models/` and rebuild after retraining.
- Keep Kaggle credentials out of version control.

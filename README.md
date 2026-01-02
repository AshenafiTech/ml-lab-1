# Heart Disease ML App

- Pipeline notebook: `notebooks/pipeline.ipynb` (downloads Kaggle heart-failure-prediction, trains Logistic Regression & Decision Tree with categorical encoding, saves joblib artifacts to `models/`).
- API: FastAPI in `api/main.py`, loads artifacts and serves `/predict/{model}` and `/health`.
- Frontend: Vite/React in `frontend/` with bold teal/amber theme; single-record form.

## Quickstart
1. Install Python deps: `pip install -r requirements.txt`
2. Set Kaggle creds in env: `export KAGGLE_USERNAME=...; export KAGGLE_KEY=...`
3. Run notebook to produce `models/*.joblib`.
4. Start API: `uvicorn api.main:app --reload --port 8000`
5. Frontend: `cd frontend && npm install && npm run dev` (set `VITE_API_BASE_URL=http://localhost:8000`).

## Deployment
- API: Dockerfile + render.yaml for Render.
- UI: Deploy `frontend/dist` to Vercel with `VITE_API_BASE_URL` pointing to API.
# ml-lab-1
# ml-lab-1

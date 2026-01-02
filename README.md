# Heart Disease ML App

- Notebook: `notebooks/pipeline.ipynb` downloads Kaggle heart-failure-prediction, trains Logistic Regression & Decision Tree, saves joblib artifacts to `models/`.
- API: FastAPI in `api/main.py`, serves `/predict/{model}` and `/health` using the saved models.
- Frontend: Vite/React single-record scorer in `frontend/`.

## Live
- Frontend: https://ml-lab-1.vercel.app/
- API: https://ml-lab-1-cuxn.onrender.com

## Local dev
1) Install deps: `pip install -r requirements.txt`
2) Kaggle creds (for data/building models): `export KAGGLE_USERNAME=...; export KAGGLE_KEY=...`
3) Run notebook to regenerate `models/*.joblib` if needed.
4) API: `uvicorn api.main:app --reload --port 8000`
5) Frontend: `cd frontend && npm install && npm run dev` (set `VITE_API_BASE_URL=http://localhost:8000` when pointing to local API).

## Deploy
- API: Dockerfile + `render.yaml` for Render.
- Frontend: Vercel build from `frontend/` with `VITE_API_BASE_URL` set to the API URL (defaults to the Render URL in code).

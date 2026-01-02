from pathlib import Path
from functools import lru_cache
from typing import Literal

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_FILES = {
    "log_reg": MODELS_DIR / "log_reg_pipeline.joblib",
    "decision_tree": MODELS_DIR / "decision_tree_pipeline.joblib",
}


def ensure_model_file(model_path: Path):
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model artifact not found at {model_path}. Train and export models first."
        )


class HeartRecord(BaseModel):
    Age: float = Field(..., ge=0, le=120)
    Sex: Literal["M", "F"]
    ChestPainType: Literal["TA", "ATA", "NAP", "ASY"]
    RestingBP: float = Field(..., ge=0)
    Cholesterol: float = Field(..., ge=0)
    FastingBS: Literal[0, 1]
    RestingECG: Literal["Normal", "ST", "LVH"]
    MaxHR: float = Field(..., ge=0)
    ExerciseAngina: Literal["Y", "N"]
    Oldpeak: float
    ST_Slope: Literal["Up", "Flat", "Down"]

    @validator("Oldpeak")
    def oldpeak_range(cls, v: float) -> float:
        if v < -5 or v > 10:
            raise ValueError("Oldpeak looks out of expected range (-5, 10)")
        return v


@lru_cache(maxsize=len(MODEL_FILES))
def load_model(model_name: str):
    if model_name not in MODEL_FILES:
        raise KeyError(f"Unsupported model '{model_name}'")
    model_path = MODEL_FILES[model_name]
    ensure_model_file(model_path)
    return joblib.load(model_path)


app = FastAPI(title="Heart Disease Predictor", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    available = {name: path.exists() for name, path in MODEL_FILES.items()}
    return {"status": "ok", "models": available}


@app.post("/predict/{model_name}")
def predict(model_name: Literal["log_reg", "decision_tree"], record: HeartRecord):
    try:
        model = load_model(model_name)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except KeyError:
        raise HTTPException(status_code=400, detail="Unsupported model")

    df = pd.DataFrame([record.dict()])
    try:
        proba = float(model.predict_proba(df)[0, 1])
        pred = int(model.predict(df)[0])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}") from exc

    return {"model": model_name, "prediction": pred, "probability": proba}


@app.get("/")
def root():
    return {
        "message": "Heart Disease Prediction API",
        "models": list(MODEL_FILES.keys()),
        "example_payload": {
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
            "ST_Slope": "Flat",
        },
    }

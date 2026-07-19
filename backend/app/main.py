import json
import pathlib

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.model import load_artifacts, predict
from app.schemas import PatientData, PredictionResponse

app = FastAPI(
    title="Heart Disease Prediction API",
    description="Predicts likelihood of heart disease from clinical features using a "
    "model trained on the UCI/Kaggle heart disease dataset.",
    version="1.0.0",
)

# Allow the React frontend (local dev + deployed) to call this API.
# In production, set ALLOWED_ORIGINS env var to a comma-separated list of
# exact origins instead of "*".
import os

origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allow_origins = ["*"] if origins_env == "*" else [o.strip() for o in origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    # Load the model once at startup so the first request isn't slow.
    load_artifacts()


@app.get("/")
def root():
    return {"status": "ok", "message": "Heart Disease Prediction API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/model-info")
def model_info():
    _, metadata = load_artifacts()
    return metadata


@app.post("/predict", response_model=PredictionResponse)
def predict_heart_disease(patient: PatientData):
    try:
        result = predict(patient.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

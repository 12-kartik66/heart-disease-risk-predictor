import json
import pathlib

import joblib
import pandas as pd

ARTIFACT_DIR = pathlib.Path(__file__).resolve().parent / "artifacts"

_model = None
_metadata = None


def load_artifacts():
    """Lazily load the trained pipeline (preprocessing + model in one object)
    and metadata once per process."""
    global _model, _metadata
    if _model is None:
        _model = joblib.load(ARTIFACT_DIR / "model.joblib")
        with open(ARTIFACT_DIR / "metadata.json") as f:
            _metadata = json.load(f)
    return _model, _metadata


def risk_bucket(probability: float) -> str:
    if probability < 0.33:
        return "low"
    if probability < 0.66:
        return "moderate"
    return "high"


def predict(patient: dict) -> dict:
    model, metadata = load_artifacts()
    feature_order = metadata["feature_order"]

    # The saved pipeline expects a DataFrame with the same column names/order
    # used at training time, since it does named-column preprocessing
    # (impute + scale numeric, one-hot encode categorical) internally.
    row = pd.DataFrame([{f: patient[f] for f in feature_order}])

    pred = int(model.predict(row)[0])
    proba = float(model.predict_proba(row)[0][1])

    return {
        "prediction": pred,
        "prediction_label": "Heart disease likely" if pred == 1 else "Heart disease unlikely",
        "probability_heart_disease": round(proba, 4),
        "risk_level": risk_bucket(proba),
        "model_name": metadata["model_name"],
    }

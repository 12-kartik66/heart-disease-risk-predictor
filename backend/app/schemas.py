from typing import Literal

from pydantic import BaseModel, Field


class PatientData(BaseModel):
    Age: int = Field(..., ge=1, le=120, description="Age in years")
    Sex: Literal["M", "F"]
    ChestPainType: Literal["TA", "ATA", "NAP", "ASY"]
    RestingBP: int = Field(..., ge=0, le=250, description="Resting blood pressure (mm Hg)")
    Cholesterol: int = Field(..., ge=0, le=700, description="Serum cholesterol (mg/dl)")
    FastingBS: int = Field(..., ge=0, le=1, description="Fasting blood sugar > 120 mg/dl")
    RestingECG: Literal["Normal", "ST", "LVH"]
    MaxHR: int = Field(..., ge=50, le=250, description="Max heart rate achieved")
    ExerciseAngina: Literal["Y", "N"]
    Oldpeak: float = Field(..., ge=-5, le=10, description="ST depression induced by exercise")
    ST_Slope: Literal["Up", "Flat", "Down"]

    class Config:
        json_schema_extra = {
            "example": {
                "Age": 52, "Sex": "M", "ChestPainType": "ATA", "RestingBP": 125,
                "Cholesterol": 212, "FastingBS": 0, "RestingECG": "Normal",
                "MaxHR": 168, "ExerciseAngina": "N", "Oldpeak": 1.0, "ST_Slope": "Up",
            }
        }


class PredictionResponse(BaseModel):
    prediction: int
    prediction_label: str
    probability_heart_disease: float
    risk_level: str
    model_name: str

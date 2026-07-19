# Heart Disease Risk Estimator

A full-stack machine learning app: a **FastAPI + scikit-learn/XGBoost** backend serves
predictions from a tuned ensemble model trained on real clinical heart-disease data, and a
**React** frontend lets you enter a patient's vitals and see the estimated risk.

```
heart-disease-app/
├── backend/
│   ├── app/
│   │   ├── main.py          FastAPI app: routes, CORS
│   │   ├── model.py         Loads the trained pipeline, runs predictions
│   │   ├── schemas.py       Pydantic request/response models
│   │   └── artifacts/       Trained model.joblib (full pipeline), metadata.json
│   ├── data/heart.csv       Training data (918 unique patients, 11 features)
│   ├── notebooks/           train_model.ipynb tunes 5 model types + a voting ensemble, saves the best
│   ├── requirements.txt
│   ├── Dockerfile
│   └── render.yaml          Render.com deploy config
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js            Calls the backend /predict endpoint
    │   └── components/       PredictionForm, ResultCard, EcgLine
    ├── vercel.json
    └── .env.example
```

## How it works

1. **Data**: `backend/data/heart.csv` — the "Heart Failure Prediction" dataset
   (fedesoriano / Kaggle), which merges five real clinical cohorts (Cleveland, Hungarian,
   Switzerland, Long Beach VA, and Statlog) into **918 unique patients**, 11 features
   (age, blood pressure, cholesterol, chest pain type, ECG results, etc.) plus a binary
   `HeartDisease` target.

   > Note: an earlier version of this project used a more commonly-referenced 1025-row
   > Kaggle mirror of the classic UCI dataset — but that file turns out to be only 302
   > unique patients duplicated ~3x (kept here as `data/heart_uci_1025_legacy.csv` for
   > reference). This dataset is genuinely larger and duplicate-free, which is why model
   > accuracy improved substantially after switching (see results table below).

2. **Training** (`notebooks/train_model.ipynb`): builds a `scikit-learn` `Pipeline` that imputes missing
   values (this dataset uses `0` as a placeholder for "not recorded" in `Cholesterol` and
   `RestingBP`, which is corrected before training) and scales/one-hot-encodes features, then
   runs `GridSearchCV` (10-fold stratified CV, optimizing ROC-AUC) over **5 model types** —
   Logistic Regression, Random Forest, Gradient Boosting, SVM, and XGBoost — plus a
   soft-voting ensemble of the top 3. The best pipeline by held-out ROC-AUC is refit on the
   full dataset and saved as a single self-contained artifact (`app/artifacts/model.joblib`),
   already included in this repo so you don't have to retrain to run the app.
3. **API** (`app/main.py`): exposes `POST /predict`, which validates the 11 input fields with
   Pydantic, runs them through the pipeline, and returns a prediction, probability, and risk
   bucket.
4. **Frontend**: a form grouped into patient profile / vitals / symptoms / exercise test
   results, with dropdowns for categorical fields (not raw codes) — submits to `/predict`
   and renders the probability as a gauge.

## Run it locally

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt

# Artifacts are already committed, so this step is optional unless you want to retrain:
# open and run backend/notebooks/train_model.ipynb

uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive API docs (Swagger UI).

### Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL defaults to http://localhost:8000
npm install
npm run dev
```

Visit `http://localhost:5173`.

## Deploying

**Backend → Render**
1. Push this repo to GitHub.
2. In Render, "New Web Service" → connect the repo → root directory `backend` → it will pick
   up `render.yaml` and the `Dockerfile` automatically (Runtime: Docker).
3. After deploy, note the public URL (e.g. `https://heart-disease-api.onrender.com`).
4. Optionally set the `ALLOWED_ORIGINS` env var on the service to your Vercel URL instead of
   `*`, to lock down CORS.

**Frontend → Vercel**
1. In Vercel, "Add New Project" → import the repo → root directory `frontend`.
2. Framework preset: Vite (auto-detected).
3. Add an environment variable `VITE_API_URL` = your Render backend URL from above.
4. Deploy. Vercel picks up `vercel.json` automatically.

Once both are live, open the Vercel URL — it will call your Render API for predictions.

## API reference

`POST /predict`

```json
{
  "Age": 52, "Sex": "M", "ChestPainType": "ATA", "RestingBP": 125,
  "Cholesterol": 212, "FastingBS": 0, "RestingECG": "Normal",
  "MaxHR": 168, "ExerciseAngina": "N", "Oldpeak": 1.0, "ST_Slope": "Up"
}
```

Response:

```json
{
  "prediction": 0,
  "prediction_label": "Heart disease unlikely",
  "probability_heart_disease": 0.0908,
  "risk_level": "low",
  "model_name": "voting_ensemble"
}
```

`GET /model-info` returns feature descriptions, categorical options, and holdout metrics for
every candidate model that was trained (not just the deployed one).
`GET /health` is a simple liveness check.

## Model performance (holdout test set)

All 5 models are hyperparameter-tuned via `GridSearchCV` with 10-fold stratified CV
(optimizing ROC-AUC); a soft-voting ensemble of the top 3 is also evaluated. `GET
/model-info` returns metrics for every candidate. Current results:

| Model | Accuracy | Precision | Recall | F1 | ROC-AUC | CV ROC-AUC |
|---|---|---|---|---|---|---|
| **Voting Ensemble (SVM + LR + RF)** ✅ deployed | 0.875 | 0.862 | 0.922 | 0.891 | **0.938** | — |
| SVM (RBF, tuned) | 0.880 | 0.877 | 0.912 | 0.894 | 0.938 | 0.921 |
| Logistic Regression (tuned) | 0.891 | 0.894 | 0.912 | 0.903 | 0.935 | 0.921 |
| Random Forest (tuned) | 0.880 | 0.870 | 0.922 | 0.895 | 0.930 | 0.931 |
| Gradient Boosting (tuned) | 0.886 | 0.886 | 0.912 | 0.899 | 0.929 | 0.927 |
| XGBoost (tuned) | 0.875 | 0.876 | 0.902 | 0.889 | 0.927 | 0.931 |

This is a large jump from the earlier 302-unique-patient dataset (~0.80 accuracy, 0.87
ROC-AUC) — the extra real, non-duplicated patients gave the models meaningfully more signal
to learn from, and hyperparameter tuning + an ensemble squeezed out a bit more on top. All
five tuned models now land within a tight band (0.87–0.94 ROC-AUC), which suggests we're
close to the ceiling of what these 11 features can predict — further gains would likely need
more features (e.g. more granular lab values) rather than more model complexity.

## Disclaimer

This is a portfolio/learning project, not a medical device. Predictions should never be used
for real clinical decisions.

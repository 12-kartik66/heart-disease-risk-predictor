FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Model artifacts (app/artifacts/model.joblib) are committed, so no training is needed at build time.
# To retrain, run backend/notebooks/train_model.ipynb before building.

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

import { useState } from 'react';
import EcgLine from './components/EcgLine';
import PredictionForm from './components/PredictionForm';
import ResultCard from './components/ResultCard';
import { predictHeartDisease } from './api';
import './App.css';

export default function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictHeartDisease(payload);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Something went wrong reaching the API.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <EcgLine />
        <div className="header-text">
          <span className="eyebrow">Clinical ML demo</span>
          <h1>Heart Disease Risk Estimator</h1>
          <p>
            Enter a patient's vitals and exercise test results below. A tuned ensemble model,
            trained on 918 real patient records merged from five clinical heart-disease
            cohorts, estimates the likelihood of heart disease.
          </p>
        </div>
      </header>

      <main className="app-main">
        <PredictionForm onSubmit={handleSubmit} loading={loading} />
        <aside className="result-column">
          <ResultCard result={result} error={error} />
        </aside>
      </main>

      <footer className="app-footer">
        <span>Dataset: Heart Failure Prediction (fedesoriano/Kaggle, 918 unique patients)</span>
        <span>FastAPI · scikit-learn · XGBoost · React</span>
      </footer>
    </div>
  );
}

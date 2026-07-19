const RISK_COPY = {
  low: { chip: 'Low risk', color: 'var(--teal)' },
  moderate: { chip: 'Moderate risk', color: 'var(--amber)' },
  high: { chip: 'High risk', color: 'var(--pulse)' },
};

export default function ResultCard({ result, error }) {
  if (error) {
    return (
      <div className="result-card result-error">
        <span className="field-label">Prediction failed</span>
        <p>{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="result-card result-empty">
        <span className="field-label">Awaiting input</span>
        <p>Fill in the panel and run a prediction to see the model's read here.</p>
      </div>
    );
  }

  const pct = Math.round(result.probability_heart_disease * 100);
  const risk = RISK_COPY[result.risk_level] || RISK_COPY.moderate;

  return (
    <div className="result-card">
      <div className="result-top">
        <span className="field-label">Model output</span>
        <span className="chip" style={{ '--chip-color': risk.color }}>
          {risk.chip}
        </span>
      </div>

      <h3 className="result-headline">{result.prediction_label}</h3>

      <div className="gauge">
        <div className="gauge-track">
          <div
            className="gauge-fill"
            style={{ width: `${pct}%`, background: risk.color }}
          />
          <div className="gauge-marker" style={{ left: `${pct}%` }} />
        </div>
        <div className="gauge-scale">
          <span>0%</span>
          <span className="data gauge-value">{pct}% probability</span>
          <span>100%</span>
        </div>
      </div>

      <p className="result-note">
        Estimated by a <span className="data">{result.model_name.replaceAll('_', ' ')}</span> model
        trained on the UCI heart disease dataset. This is a portfolio demo, not a diagnosis —
        always consult a clinician for real medical decisions.
      </p>
    </div>
  );
}

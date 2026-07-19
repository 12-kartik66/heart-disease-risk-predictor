import { useState } from 'react';

const DEFAULTS = {
  Age: 52,
  Sex: 'M',
  ChestPainType: 'ATA',
  RestingBP: 125,
  Cholesterol: 212,
  FastingBS: 0,
  RestingECG: 'Normal',
  MaxHR: 168,
  ExerciseAngina: 'N',
  Oldpeak: 1.0,
  ST_Slope: 'Up',
};

const CP_OPTIONS = [
  { value: 'TA', label: 'Typical angina' },
  { value: 'ATA', label: 'Atypical angina' },
  { value: 'NAP', label: 'Non-anginal pain' },
  { value: 'ASY', label: 'Asymptomatic' },
];

const RESTECG_OPTIONS = [
  { value: 'Normal', label: 'Normal' },
  { value: 'ST', label: 'ST-T wave abnormality' },
  { value: 'LVH', label: 'Left ventricular hypertrophy' },
];

const SLOPE_OPTIONS = [
  { value: 'Up', label: 'Upsloping' },
  { value: 'Flat', label: 'Flat' },
  { value: 'Down', label: 'Downsloping' },
];

function NumberField({ label, hint, name, value, onChange, min, max, step = 1 }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className="data"
        type="number"
        name={name}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(name, e.target.value === '' ? '' : Number(e.target.value))}
        required
      />
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select className="data" name={name} value={value} onChange={(e) => onChange(name, e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({ label, name, value, onChange, yesValue, noValue, yesLabel = 'Yes', noLabel = 'No' }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="toggle-group" role="radiogroup" aria-label={label}>
        <button
          type="button"
          className={`toggle-btn ${value === yesValue ? 'active' : ''}`}
          onClick={() => onChange(name, yesValue)}
          aria-pressed={value === yesValue}
        >
          {yesLabel}
        </button>
        <button
          type="button"
          className={`toggle-btn ${value === noValue ? 'active' : ''}`}
          onClick={() => onChange(name, noValue)}
          aria-pressed={value === noValue}
        >
          {noLabel}
        </button>
      </div>
    </div>
  );
}

export default function PredictionForm({ onSubmit, loading }) {
  const [form, setForm] = useState(DEFAULTS);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const handleReset = () => setForm(DEFAULTS);

  return (
    <form className="prediction-form" onSubmit={handleSubmit}>
      <fieldset>
        <legend>
          <span className="legend-num">01</span> Patient profile
        </legend>
        <div className="field-grid">
          <NumberField label="Age" name="Age" value={form.Age} onChange={handleChange} min={1} max={120} />
          <ToggleField
            label="Sex"
            name="Sex"
            value={form.Sex}
            onChange={handleChange}
            yesValue="M"
            noValue="F"
            yesLabel="Male"
            noLabel="Female"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <span className="legend-num">02</span> Vitals
        </legend>
        <div className="field-grid">
          <NumberField
            label="Resting blood pressure"
            hint="mm Hg"
            name="RestingBP"
            value={form.RestingBP}
            onChange={handleChange}
            min={0}
            max={250}
          />
          <NumberField
            label="Serum cholesterol"
            hint="mg/dl (0 if unknown/not recorded)"
            name="Cholesterol"
            value={form.Cholesterol}
            onChange={handleChange}
            min={0}
            max={700}
          />
          <NumberField
            label="Max heart rate achieved"
            hint="bpm, during exercise test"
            name="MaxHR"
            value={form.MaxHR}
            onChange={handleChange}
            min={50}
            max={250}
          />
          <ToggleField
            label="Fasting blood sugar > 120 mg/dl"
            name="FastingBS"
            value={form.FastingBS}
            onChange={handleChange}
            yesValue={1}
            noValue={0}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <span className="legend-num">03</span> Symptoms
        </legend>
        <div className="field-grid">
          <SelectField
            label="Chest pain type"
            name="ChestPainType"
            value={form.ChestPainType}
            onChange={handleChange}
            options={CP_OPTIONS}
          />
          <ToggleField
            label="Exercise-induced angina"
            name="ExerciseAngina"
            value={form.ExerciseAngina}
            onChange={handleChange}
            yesValue="Y"
            noValue="N"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <span className="legend-num">04</span> Exercise test results
        </legend>
        <div className="field-grid">
          <SelectField
            label="Resting ECG result"
            name="RestingECG"
            value={form.RestingECG}
            onChange={handleChange}
            options={RESTECG_OPTIONS}
          />
          <NumberField
            label="ST depression (oldpeak)"
            hint="induced by exercise, relative to rest"
            name="Oldpeak"
            value={form.Oldpeak}
            onChange={handleChange}
            min={-5}
            max={10}
            step={0.1}
          />
          <SelectField
            label="Slope of peak ST segment"
            name="ST_Slope"
            value={form.ST_Slope}
            onChange={handleChange}
            options={SLOPE_OPTIONS}
          />
        </div>
      </fieldset>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={handleReset} disabled={loading}>
          Reset to sample
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Reading vitals…' : 'Run prediction'}
        </button>
      </div>
    </form>
  );
}

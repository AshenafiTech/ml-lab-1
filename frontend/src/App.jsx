import { useMemo, useState } from "react";

const initialForm = {
  Age: 54,
  Sex: "M",
  ChestPainType: "ASY",
  RestingBP: 140,
  Cholesterol: 239,
  FastingBS: 0,
  RestingECG: "Normal",
  MaxHR: 160,
  ExerciseAngina: "N",
  Oldpeak: 1.2,
  ST_Slope: "Flat",
};

const fieldMeta = [
  { name: "Age", type: "number", min: 0, max: 120 },
  { name: "Sex", type: "select", options: ["M", "F"] },
  { name: "ChestPainType", type: "select", options: ["TA", "ATA", "NAP", "ASY"] },
  { name: "RestingBP", type: "number", min: 0 },
  { name: "Cholesterol", type: "number", min: 0 },
  { name: "FastingBS", type: "select", options: [0, 1] },
  { name: "RestingECG", type: "select", options: ["Normal", "ST", "LVH"] },
  { name: "MaxHR", type: "number", min: 0 },
  { name: "ExerciseAngina", type: "select", options: ["Y", "N"] },
  { name: "Oldpeak", type: "number", step: 0.1 },
  { name: "ST_Slope", type: "select", options: ["Up", "Flat", "Down"] },
];

const modelOptions = [
  { value: "log_reg", label: "Logistic Regression" },
  { value: "decision_tree", label: "Decision Tree" },
];

function App() {
  const [form, setForm] = useState(initialForm);
  const [model, setModel] = useState("log_reg");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const apiBase = useMemo(() => {
    return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  }, []);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${apiBase}/predict/${model}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Request failed");
      }
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <div className="badge">Heart Disease Predictor</div>
          <h1 style={{ margin: "8px 0 0" }}>Single-record scorer</h1>
        </div>
        <div className="status">
          <span className="status-dot" />
          API: {apiBase}
        </div>
      </header>

      <main className="card" style={{ marginTop: 20 }}>
        <form onSubmit={handleSubmit} className="form-shell">
          <div className="grid">
            {fieldMeta.map((field) => (
              <label key={field.name} className="label">
                <span>{field.name}</span>
                {field.type === "select" ? (
                  <select
                    value={form[field.name]}
                    onChange={(e) =>
                      handleChange(
                        field.name,
                        typeof field.options[0] === "number"
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    value={form[field.name]}
                    onChange={(e) => handleChange(field.name, Number(e.target.value))}
                    min={field.min}
                    max={field.max}
                    step={field.step || 1}
                    required
                  />
                )}
              </label>
            ))}
          </div>

          <div className="controls">
            <div className="model-panel">
              <div className="label" style={{ margin: 0 }}>
                <span style={{ color: "var(--text)" }}>Model</span>
                <select value={model} onChange={(e) => setModel(e.target.value)}>
                  {modelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="help">Switch between Logistic Regression and Decision Tree.</p>
            </div>

            <div className="actions">
              <button type="submit" disabled={loading}>
                {loading ? "Scoring..." : "Predict"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setForm(initialForm);
                  setResult(null);
                  setError(null);
                }}
                style={{ background: "rgba(255,255,255,0.08)", color: "var(--text)", border: "1px solid var(--border)" }}
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {error && <p className="error">Error: {error}</p>}
        {result && (
          <div className="result-card">
            <div style={{ fontWeight: 700 }}>Prediction: {result.prediction === 1 ? "Heart Disease" : "No Heart Disease"}</div>
            <div>Probability: {(result.probability * 100).toFixed(1)}%</div>
            <div style={{ color: "var(--muted)", marginTop: 6 }}>Model: {result.model}</div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

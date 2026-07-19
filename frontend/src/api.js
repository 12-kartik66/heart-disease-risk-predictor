const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function predictHeartDisease(payload) {
  const res = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function fetchModelInfo() {
  const res = await fetch(`${API_URL}/model-info`);
  if (!res.ok) throw new Error('Could not load model info');
  return res.json();
}

const KEY = "orderly_recent_views";

export function saveRecentView({ section, label, sublabel, path, state = null }) {
  const existing = getRecentViews().filter((v) => v.section !== section);
  const updated = [
    { section, label, sublabel, path, state, timestamp: Date.now() },
    ...existing,
  ].slice(0, 6);
  try {
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // storage unavailable — silently ignore
  }
}

export function getRecentViews() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

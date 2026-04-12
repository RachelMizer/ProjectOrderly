import { getAuthHeaders } from "./auth";

const API_BASE = "http://127.0.0.1:8000/api/v1/admin";

async function parseJson(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return {};
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function fetchProductPerformance({ name = null, variant = null, year = null, month = null } = {}) {
  const params = new URLSearchParams();
  if (name)    params.set("name",    name);
  if (variant) params.set("variant", variant);
  if (year)    params.set("year",    year);
  if (month)   params.set("month",   month);
  const qs  = params.toString();
  const url = qs
    ? `${API_BASE}/reports/product-performance?${qs}`
    : `${API_BASE}/reports/product-performance`;

  const response = await fetch(url, {
    method: "GET",
    headers: { ...getAuthHeaders() },
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(data?.detail || "Failed to load product performance data.");
  }

  return data;
}

export async function fetchSalesSummary({ year = null, month = null } = {}) {
  const params = new URLSearchParams();
  if (year)  params.set("year",  year);
  if (month) params.set("month", month);
  const qs = params.toString();
  const url = qs
    ? `${API_BASE}/reports/sales-summary?${qs}`
    : `${API_BASE}/reports/sales-summary`;

  const response = await fetch(url, {
    method: "GET",
    headers: { ...getAuthHeaders() },
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new Error(data?.detail || "Failed to load sales summary.");
  }

  return data;
}

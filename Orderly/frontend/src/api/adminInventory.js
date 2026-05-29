import { getAuthHeaders } from "./auth";
import API_HOST from '../config';

const API_BASE = `${API_HOST}/api/v1/admin/inventory`;

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

async function parseJson(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return {};
  }

  try {
    return await response.json();
  } catch {
    return {};
  }
}

function buildError(defaultMessage, response, data = {}) {
  const err = new Error(data?.message || data?.detail || defaultMessage);
  err.response = { status: response.status, data };
  return err;
}

export async function fetchInventory() {
  const response = await fetch(API_BASE, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw buildError("Failed to load inventory.", response, data);
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  return [];
}

export async function createInventoryItem(payload) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      ...JSON_HEADERS,
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw buildError("Failed to create inventory item.", response, data);
  }

  return data;
}

export async function updateInventoryItem(itemId, payload) {
  const response = await fetch(`${API_BASE}/${itemId}`, {
    method: "PATCH",
    headers: {
      ...JSON_HEADERS,
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw buildError("Failed to update inventory item.", response, data);
  }

  return data;
}

export async function fetchLowStock() {
  const response = await fetch(`${API_BASE}/low-stock`, {
    method: "GET",
    headers: { ...getAuthHeaders() },
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw buildError("Failed to load low stock items.", response, data);
  }

  return data;
}

export async function fetchInventoryItem(itemId) {
  const response = await fetch(`${API_BASE}/${itemId}`, {
    method: "GET",
    headers: { ...getAuthHeaders() },
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw buildError("Failed to load inventory item.", response, data);
  }
  return data;
}

export async function deleteInventoryItem(itemId) {
  const response = await fetch(`${API_BASE}/${itemId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const data = await parseJson(response);
    throw buildError("Failed to delete inventory item.", response, data);
  }

  return true;
}
import { getAuthHeaders } from "./auth";

const API_BASE = "http://127.0.0.1:8000/api/v1/orders/";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

// Response and error helper functions
async function parseJson(response){
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

function buildError(defaultMessage, response, data = {} ) {
  const err = new Error(data?.message || data?.detail || defaultMessage);
  err.response = {
    status: response.status,
    data,
  };
  return err;
}

// Get Order Detail
// GET /api/v1/orders/{orderId}
export async function getOrderDetail(orderId) {
  const response = await fetch(`${API_BASE}${orderId}`, {
    method: "GET",
    headers: {
      ...JSON_HEADERS,
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  const data = await parseJson(response);

  if (!response.ok){
    throw buildError("Failed to fetch order detail", response, data);
  }

  return data;
}

// Submit Order
// PATCH /api/v1/orders/{orderId}/submit
export async function submitOrder(orderId, paymentData) {
  const response = await fetch(`${API_BASE}${orderId}/submit`, {
    method: "PATCH",
    headers: {
      ...JSON_HEADERS,
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(paymentData),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw buildError("Failed to submit order", response, data);
  }

  return data;
}

// Get Order History
// GET /api/v1/orders/me?page=&pageSize=
export async function getOrderHistory({ page = 1, pageSize = 25} = {}) {
  const query = new URLSearchParams({
    page,
    pageSize,
  });

  const response = await fetch(`${API_BASE}me?${query.toString()}`, {
    method: "GET",
    headers: {
      ...JSON_HEADERS,
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw buildError("Failed to fetch order history", response, data);
  }

  return data;
}

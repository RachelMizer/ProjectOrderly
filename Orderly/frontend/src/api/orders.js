import { getAuthHeaders } from "./auth";

// Returns a persistent guest cart token stored in localStorage.
// Acts as the guestEmail identifier for unauthenticated cart operations.
export function getGuestCartEmail() {
  let email = localStorage.getItem("guestCartEmail");
  if (!email) {
    const uid = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    email = `guest_${uid}@cart.local`;
    localStorage.setItem("guestCartEmail", email);
  }
  return email;
}

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

// Merge guest cart into the authenticated user's cart after login/register.
// Reads guestCartEmail from localStorage. No-ops if there is no guest cart.
export async function mergeGuestCart() {
  const guestEmail = localStorage.getItem("guestCartEmail");
  if (!guestEmail) return;

  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return;

  try {
    // 1. Fetch guest cart items
    const guestDraftRes = await fetch(`${API_BASE}draft`, {
      method: "POST",
      headers: { ...JSON_HEADERS },
      body: JSON.stringify({ guestEmail }),
    });
    const guestDraft = await guestDraftRes.json();
    if (!guestDraft.id) return;

    const guestDetailRes = await fetch(
      `${API_BASE}${guestDraft.id}?guestEmail=${encodeURIComponent(guestEmail)}`
    );
    const guestCart = await guestDetailRes.json();
    const items = guestCart.items || [];

    if (items.length) {
      // 2. Ensure authenticated draft order exists
      await fetch(`${API_BASE}draft`, {
        method: "POST",
        headers: { ...JSON_HEADERS, ...getAuthHeaders() },
        body: JSON.stringify({}),
      });

      // 3. Copy each item and its modifiers into the authenticated cart
      for (const item of items) {
        const addRes = await fetch(`${API_BASE}items`, {
          method: "POST",
          headers: { ...JSON_HEADERS, ...getAuthHeaders() },
          body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity }),
        });
        const added = await addRes.json();

        if (item.modifiers?.length && added.orderItemId) {
          for (const mod of item.modifiers) {
            await fetch(`${API_BASE}items/${added.orderItemId}/modifiers`, {
              method: "POST",
              headers: { ...JSON_HEADERS, ...getAuthHeaders() },
              body: JSON.stringify({ modifierId: mod.optionId, quantity: 1 }),
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to merge guest cart:", err);
  } finally {
    localStorage.removeItem("guestCartEmail");
    window.dispatchEvent(new Event("cart-updated"));
  }
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

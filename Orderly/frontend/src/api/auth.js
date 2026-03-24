// src/api/auth.js

const API_BASE = "http://127.0.0.1:8000/api/v1/auth/";
const ACCESS_TOKEN_KEY = "accessToken";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

// -------------------------
// TOKEN HELPERS
// -------------------------
export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function setStoredAccessToken(token) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

function clearStoredAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getStoredAccessToken());
}

// Optional helper for future protected API calls
export function getAuthHeaders() {
  const token = getStoredAccessToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

// -------------------------
// RESPONSE / ERROR HELPERS
// -------------------------
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
  err.response = {
    status: response.status,
    data,
  };
  return err;
}

// -------------------------
// REGISTER
// Route: /api/v1/auth/register
// -------------------------
export async function register(form) {
  const response = await fetch(`${API_BASE}register`, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
    }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw buildError("Registration failed", response, data);
  }

  if (data.accessToken) {
    setStoredAccessToken(data.accessToken);
  }

  return data;
}

// -------------------------
// LOGIN
// Route: /api/v1/auth/login
// -------------------------
export async function login(form) {
  const response = await fetch(`${API_BASE}login`, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify({
      email: form.email,
      password: form.password,
    }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw buildError("Login failed", response, data);
  }

  if (data.accessToken) {
    setStoredAccessToken(data.accessToken);
  }

  return data;
}

// -------------------------
// LOGOUT
// Route: /api/v1/auth/logout
// -------------------------
export async function logout() {
  let data = {};

  try {
    const response = await fetch(`${API_BASE}logout`, {
      method: "POST",
      headers: JSON_HEADERS,
      credentials: "include",
      body: JSON.stringify({}),
    });

    data = await parseJson(response);

    if (!response.ok) {
      throw buildError("Logout failed", response, data);
    }

    return data;
  } finally {
    clearStoredAccessToken();
  }
}

// -------------------------
// PASSWORD RESET REQUEST
// Route: /api/v1/auth/password-reset
// Body: { email }
// -------------------------
export async function requestPasswordReset(email) {
  const response = await fetch(`${API_BASE}password-reset`, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw buildError("Password reset request failed", response, data);
  }

  return data;
}

// -------------------------
// PASSWORD RESET CONFIRM
// Route: /api/v1/auth/password-reset/confirm
// Body: { uid, token, newPassword }
// -------------------------
export async function confirmPasswordReset({ uid, token, newPassword }) {
  const response = await fetch(`${API_BASE}password-reset/confirm`, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify({
      uid,
      token,
      newPassword,
    }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw buildError("Password reset confirmation failed", response, data);
  }

  return data;
}
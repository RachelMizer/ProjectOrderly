// src/api/auth.js

const API_BASE = "http://127.0.0.1:8000/api/v1/auth/";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

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

function setStoredRefreshToken(token) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
}

function clearStoredTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getStoredAccessToken());
}

export function getAuthHeaders() {
  const token = getStoredAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// -------------------------
// RESPONSE / ERROR HELPERS
// -------------------------
async function parseJson(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return {};
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

// -------------------------
// REGISTER
// -------------------------
export async function register(form) {
  const response = await fetch(`${API_BASE}register`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(form),
  });

  const data = await parseJson(response);
  if (!response.ok) throw buildError("Registration failed", response, data);

  if (data.access) setStoredAccessToken(data.access);
  if (data.refresh) setStoredRefreshToken(data.refresh);

  return data;
}

// -------------------------
// LOGIN
// -------------------------
export async function login(form) {
  const response = await fetch(`${API_BASE}login`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(form),
  });

  const data = await parseJson(response);
  if (!response.ok) throw buildError("Login failed", response, data);

  // FIXED: store the correct token field
  if (data.accessToken) setStoredAccessToken(data.accessToken);

  return data;
}


// -------------------------
// LOGOUT
// -------------------------
export function logout() {
  clearStoredTokens();
}

// -------------------------
// PASSWORD RESET REQUEST
// -------------------------
export async function requestPasswordReset(email) {
  const response = await fetch(`${API_BASE}password-reset`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ email }),
  });

  if (!response.ok) throw new Error("Password reset request failed");
  return response.json();
}

// -------------------------
// PASSWORD RESET CONFIRM
// -------------------------
export async function confirmPasswordReset({ uid, token, newPassword }) {
  const response = await fetch(`${API_BASE}password-reset/confirm`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ uid, token, newPassword }),
  });

  if (!response.ok) throw new Error("Password reset confirmation failed");
  return response.json();
}

// -------------------------
// GET PROFILE
// -------------------------
export async function getProfile() {
  const response = await fetch("http://127.0.0.1:8000/api/v1/users/me/", {
    method: "GET",
    headers: {
      ...JSON_HEADERS,
      ...getAuthHeaders(),
    },
  });

  const data = await parseJson(response);
  if (!response.ok) throw buildError("Failed to fetch profile", response, data);

  return data;
}

// -------------------------
// UPDATE PROFILE
// -------------------------
export async function updateProfile(form) {
  const response = await fetch("http://127.0.0.1:8000/api/v1/users/me/", {
    method: "PATCH",
    headers: {
      ...JSON_HEADERS,
      ...getAuthHeaders(),
    },
    body: JSON.stringify(form),
  });

  const data = await parseJson(response);
  if (!response.ok) throw buildError("Failed to update profile", response, data);

  return data;
}

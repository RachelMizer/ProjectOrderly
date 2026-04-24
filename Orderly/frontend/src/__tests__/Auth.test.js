import {
  getStoredAccessToken,
  isAuthenticated,
  getAuthHeaders,
  register,
  login,
  logout,
  requestPasswordReset,
  confirmPasswordReset,
  getProfile,
  updateProfile,
} from "../api/auth";

function makeJsonResponse({
  ok = true,
  status = 200,
  body = {},
  contentType = "application/json",
}) {
  return Promise.resolve({
    ok,
    status,
    headers: {
      get: (name) =>
        name?.toLowerCase() === "content-type" ? contentType : null,
    },
    json: async () => body,
  });
}

describe("auth.js", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test("getStoredAccessToken returns stored token", () => {
    localStorage.setItem("accessToken", "abc123");
    expect(getStoredAccessToken()).toBe("abc123");
  });

  test("isAuthenticated returns false when no token exists", () => {
    expect(isAuthenticated()).toBe(false);
  });

  test("isAuthenticated returns true when token exists", () => {
    localStorage.setItem("accessToken", "abc123");
    expect(isAuthenticated()).toBe(true);
  });

  test("getAuthHeaders returns empty object without token", () => {
    expect(getAuthHeaders()).toEqual({});
  });

  test("getAuthHeaders returns bearer token header", () => {
    localStorage.setItem("accessToken", "abc123");
    expect(getAuthHeaders()).toEqual({
      Authorization: "Bearer abc123",
    });
  });

  test("register succeeds and stores accessToken", async () => {
    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: true,
        status: 201,
        body: {
          accessToken: "new-access",
          user: { email: "test@example.com" },
        },
      })
    );

    const result = await register({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(result.user.email).toBe("test@example.com");
    expect(localStorage.getItem("accessToken")).toBe("new-access");
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });

  test("register throws backend message on failure", async () => {
    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: false,
        status: 400,
        body: { message: "Email already exists" },
      })
    );

    await expect(
      register({ email: "dup@example.com", password: "Password123!" })
    ).rejects.toThrow("Email already exists");
  });

  test("register throws fallback message when backend body is empty", async () => {
    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: false,
        status: 400,
        body: {},
      })
    );

    await expect(
      register({ email: "dup@example.com", password: "Password123!" })
    ).rejects.toThrow("Registration failed");
  });

  test("login succeeds and stores accessToken field", async () => {
    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: true,
        status: 200,
        body: {
          accessToken: "login-token",
          user: { role: "CUSTOMER" },
        },
      })
    );

    const result = await login({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(result.user.role).toBe("CUSTOMER");
    expect(localStorage.getItem("accessToken")).toBe("login-token");
  });

  test("login throws backend detail on failure", async () => {
    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: false,
        status: 401,
        body: { detail: "Invalid credentials" },
      })
    );

    await expect(
      login({ email: "test@example.com", password: "wrong" })
    ).rejects.toThrow("Invalid credentials");
  });

  test("logout clears stored tokens", () => {
    localStorage.setItem("accessToken", "abc123");
    localStorage.setItem("refreshToken", "refresh123");

    logout();

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });

  test("requestPasswordReset succeeds", async () => {
    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: true,
        status: 200,
        body: { message: "Reset sent" },
      })
    );

    const result = await requestPasswordReset("test@example.com");
    expect(result.message).toBe("Reset sent");
  });

  test("requestPasswordReset throws on failure", async () => {
    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: false,
        status: 400,
        body: {},
      })
    );

    await expect(
      requestPasswordReset("bad@example.com")
    ).rejects.toThrow("Password reset request failed");
  });

  test("confirmPasswordReset succeeds", async () => {
    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: true,
        status: 200,
        body: { message: "Password updated" },
      })
    );

    const result = await confirmPasswordReset({
      uid: "abc",
      token: "reset-token",
      newPassword: "NewPassword123!",
    });

    expect(result.message).toBe("Password updated");
  });

  test("confirmPasswordReset throws on failure", async () => {
    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: false,
        status: 400,
        body: {},
      })
    );

    await expect(
      confirmPasswordReset({
        uid: "abc",
        token: "bad-token",
        newPassword: "NewPassword123!",
      })
    ).rejects.toThrow("Password reset confirmation failed");
  });

  test("getProfile succeeds and includes auth header", async () => {
    localStorage.setItem("accessToken", "profile-token");

    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: true,
        status: 200,
        body: { firstName: "Kenny", email: "kenny@example.com" },
      })
    );

    const result = await getProfile();

    expect(result.firstName).toBe("Kenny");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/v1/users/me/",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer profile-token",
          "Content-Type": "application/json",
        }),
      })
    );
  });

  test("getProfile throws backend message on failure", async () => {
    localStorage.setItem("accessToken", "profile-token");

    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: false,
        status: 403,
        body: { message: "Forbidden" },
      })
    );

    await expect(getProfile()).rejects.toThrow("Forbidden");
  });

  test("updateProfile succeeds and includes auth header", async () => {
    localStorage.setItem("accessToken", "profile-token");

    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: true,
        status: 200,
        body: { firstName: "Updated", city: "Raleigh" },
      })
    );

    const payload = { firstName: "Updated", city: "Raleigh" };
    const result = await updateProfile(payload);

    expect(result.firstName).toBe("Updated");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/v1/users/me/",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          Authorization: "Bearer profile-token",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      })
    );
  });

  test("updateProfile throws backend detail on failure", async () => {
    localStorage.setItem("accessToken", "profile-token");

    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: false,
        status: 400,
        body: { detail: "Invalid state" },
      })
    );

    await expect(updateProfile({ state: "North Carolina" })).rejects.toThrow(
      "Invalid state"
    );
  });

  test("parseJson safely handles non-json responses in register failure", async () => {
    global.fetch.mockResolvedValueOnce(
      await makeJsonResponse({
        ok: false,
        status: 500,
        body: {},
        contentType: "text/html",
      })
    );

    await expect(
      register({ email: "test@example.com", password: "Password123!" })
    ).rejects.toThrow("Registration failed");
  });

  test("parseJson safely handles invalid json body in login failure", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: {
        get: () => "application/json",
      },
      json: async () => {
        throw new Error("bad json");
      },
    });

    await expect(
      login({ email: "test@example.com", password: "wrong" })
    ).rejects.toThrow("Login failed");
  });
});
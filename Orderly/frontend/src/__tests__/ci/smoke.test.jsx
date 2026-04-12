import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";

const mockNavigate = jest.fn();

import { MemoryRouter } from "react-router-dom";

function renderWithRouter(ui, { route = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}

import Login from "../../pages/Auth/Login";
import Register from "../../pages/Auth/Register";
import StoreFront from "../../pages/StoreFront";
import OrderHistory from "../../pages/Orders/OrderHistory";

jest.mock("../../api/auth", () => ({
  isAuthenticated: jest.fn(() => false),
  logout: jest.fn(),
  getAuthHeaders: jest.fn(() => ({
    Authorization: "Bearer fake-token",
  })),
}));

function makeResponse({
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
        String(name).toLowerCase() === "content-type" ? contentType : null,
    },
    json: async () => body,
  });
}

describe("CI smoke tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    global.fetch = jest.fn((input, init = {}) => {
      const url = typeof input === "string" ? input : input?.url || "";
      const method = (init?.method || input?.method || "GET").toUpperCase();

      if (method === "GET" && url.includes("/api/v1/categories")) {
        return makeResponse({
          body: {
            results: [
              { id: 1, name: "Coffee" },
              { id: 2, name: "Tea" },
            ],
          },
        });
      }

      if (
        method === "GET" &&
        url.includes("/api/v1/products") &&
        !url.includes("/api/v1/admin/products")
      ) {
        return makeResponse({
          body: {
            results: [
              {
                id: 1,
                name: "Latte",
                description: "Espresso with steamed milk",
                category: { id: 1, name: "Coffee" },
                variants: [],
                imageUrl: null,
              },
            ],
          },
        });
      }

      if (method === "GET" && url.includes("/api/v1/orders/draft")) {
        return makeResponse({ body: { id: null } });
      }

      if (method === "GET" && url.includes("/api/v1/orders/history")) {
        return makeResponse({ body: { results: [] } });
      }

      if (method === "GET" && url.match(/\/api\/v1\/orders(\?|$)/)) {
        return makeResponse({ body: { results: [] } });
      }

      if (method === "POST" && url.includes("/api/v1/auth/login")) {
        return makeResponse({
          status: 200,
          body: {
            access: "fake-access-token",
            refresh: "fake-refresh-token",
            user: {
              id: 1,
              firstName: "Test",
              lastName: "User",
              role: "CUSTOMER",
            },
          },
        });
      }

      if (method === "POST" && url.includes("/api/v1/auth/register")) {
        return makeResponse({
          status: 201,
          body: {
            access: "fake-access-token",
            refresh: "fake-refresh-token",
            user: {
              id: 2,
              firstName: "New",
              lastName: "User",
              role: "CUSTOMER",
            },
          },
        });
      }

      return makeResponse({ body: {} });
    });
  });

  test("login works", async () => {
    renderWithRouter(<Login setLoggedIn={jest.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in|login/i })
    ).toBeInTheDocument();
  });

  test("register works", async () => {
    renderWithRouter(<Register setLoggedIn={jest.fn()} />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  test("storefront renders", async () => {
    renderWithRouter(<StoreFront />);

    expect(await screen.findByText("Latte")).toBeInTheDocument();
    expect(screen.getByText(/n\/a/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /view & customize/i })
    ).toBeInTheDocument();
  });

  test("order history empty state", async () => {
    localStorage.setItem("accessToken", "fake-access-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        firstName: "Test",
        role: "CUSTOMER",
      })
    );

    renderWithRouter(<OrderHistory />);

    expect(
      await screen.findByText(/no past orders found/i)
    ).toBeInTheDocument();
  });
});
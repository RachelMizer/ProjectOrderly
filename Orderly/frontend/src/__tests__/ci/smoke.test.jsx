// src/__tests__/ci/smoke.test.jsx

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// ✅ FIXED PATHS (go up TWO levels)
import Login from "../../pages/Auth/Login";
import Register from "../../pages/Auth/Register";
import ResetPasswordRequest from "../../pages/Auth/ResetPasswordRequest";
import Profile from "../../pages/Auth/Profile";
import StoreFront from "../../pages/StoreFront";
import OrderHistory from "../../pages/Orders/OrderHistory";
import OrderDetail from "../../pages/Orders/OrderDetail";

import * as auth from "../../api/auth";
import * as ordersApi from "../../api/orders";

// ✅ MOCKS (fixed paths)
jest.mock("../../api/auth", () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: jest.fn(),
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  requestPasswordReset: jest.fn(),
  confirmPasswordReset: jest.fn(),
}));

jest.mock("../../api/orders", () => ({
  getOrderHistory: jest.fn(),
  getOrderDetail: jest.fn(),
}));

describe("CI smoke tests", () => {
  const mockSetLoggedIn = jest.fn();

  const mockProfile = {
    firstName: "Kenneth",
    lastName: "Bacdayan",
    email: "kenny@test.com",
    streetAddress: "123 Main St",
    city: "Raleigh",
    state: "NC",
    zipcode: "27601",
    phone: "9195551234",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // ✅ Mock fetch for storefront
    global.fetch = jest.fn((url) => {
      if (url.includes("categories")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ results: [{ id: 1, name: "Coffee" }] }),
        });
      }

      if (url.includes("variants")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            results: [
              {
                id: 101,
                name: "Small",
                unitPrice: 4.5,
                stockQuantity: 10,
              },
            ],
          }),
        });
      }

      if (url.includes("products")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            results: [{ id: 1, name: "Latte" }],
          }),
        });
      }

      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });
  });

  test("login works", async () => {
    auth.login.mockResolvedValue({ accessToken: "fake-token" });

    render(
        <MemoryRouter>
        <Login setLoggedIn={mockSetLoggedIn} />
        </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "customer1@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
        expect(auth.login).toHaveBeenCalledWith({
        email: "customer1@example.com",
        password: "Password123!",
        });
    });
    });

  test("register works", async () => {
    auth.register.mockResolvedValue({ accessToken: "token" });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });

    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "john@test.com" },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(auth.register).toHaveBeenCalled();
    });
  });

  test("password reset request works", async () => {
    auth.requestPasswordReset.mockResolvedValue({});

    render(<ResetPasswordRequest />);

    fireEvent.change(screen.getByLabelText(/^email$/i), {
        target: { value: "customer1@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
        expect(auth.requestPasswordReset).toHaveBeenCalledWith("customer1@example.com");
    });

    expect(
        await screen.findByText(/password reset email sent/i)
    ).toBeInTheDocument();
    });

  test("profile loads and saves", async () => {
    auth.getProfile.mockResolvedValue(mockProfile);
    auth.updateProfile.mockResolvedValue({
      ...mockProfile,
      firstName: "Ken",
    });

    render(<Profile />);

    const firstName = await screen.findByLabelText(/first name/i);

    expect(screen.getByLabelText(/email/i)).toHaveValue("kenny@test.com");

    fireEvent.change(firstName, { target: { value: "Ken" } });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(auth.updateProfile).toHaveBeenCalled();
    });
  });

  test("storefront renders", async () => {
    render(
      <MemoryRouter>
        <StoreFront />
      </MemoryRouter>
    );

    expect(await screen.findByText("Latte")).toBeInTheDocument();
    expect(screen.getByText("$4.50")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add to cart/i })
    ).toBeInTheDocument();
  });

  test("order history empty state", async () => {
    ordersApi.getOrderHistory.mockResolvedValue({
      count: 0,
      pageSize: 25,
      next: null,
      previous: null,
      results: [],
    });

    render(
      <MemoryRouter initialEntries={["/order-history"]}>
        <Routes>
          <Route path="/order-history" element={<OrderHistory />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/no past orders found/i)
    ).toBeInTheDocument();
  });

  test("order detail renders", async () => {
    ordersApi.getOrderDetail.mockResolvedValue({
      id: 15,
      status: "COMPLETED",
      totalDue: "9.50",
      items: [
        {
          itemId: 1,
          productName: "Chai",
          variantName: "Medium",
          quantity: 2,
          unitPriceCharged: "4.50",
          itemTotal: "9.00",
          modifiers: [],
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={["/orders/15"]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/order #15/i)).toBeInTheDocument();
    expect(screen.getByText(/chai/i)).toBeInTheDocument();
  });
});
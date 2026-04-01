import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Auth/Login";
import * as auth from "../api/auth";

jest.mock("../api/auth", () => ({
  login: jest.fn(),
  isAuthenticated: jest.fn(),
  logout: jest.fn(),
}));

describe("Auth Flow", () => {
  const mockSetLoggedIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("successful login calls auth.login with form data", async () => {
    auth.login.mockResolvedValue({
      accessToken: "token123",
    });

    render(
      <MemoryRouter>
        <Login setLoggedIn={mockSetLoggedIn} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
      });
    });

    expect(mockSetLoggedIn).toHaveBeenCalledWith(true);
  });

  test("shows backend login error in the UI", async () => {
    auth.login.mockRejectedValue(new Error("Login failed"));

    render(
      <MemoryRouter>
        <Login setLoggedIn={mockSetLoggedIn} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "bad@test.com" },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^login$/i }));

    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
  });

  test("shows fallback error when login fails without backend response", async () => {
    auth.login.mockRejectedValue(new Error("Network error"));

    render(
      <MemoryRouter>
        <Login setLoggedIn={mockSetLoggedIn} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^login$/i }));

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });
});
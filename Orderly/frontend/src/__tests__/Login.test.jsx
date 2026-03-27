import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";
import * as auth from "../api/auth";

jest.mock("../api/auth");

describe("Login Page", () => {
  const mockSetLoggedIn = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders login form", () => {
    render(
      <MemoryRouter>
        <Login setLoggedIn={mockSetLoggedIn} />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("calls login API with submitted form data", async () => {
    auth.login.mockResolvedValue({
      accessToken: "fake-token",
    });

    render(
      <MemoryRouter>
        <Login setLoggedIn={mockSetLoggedIn} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
      });
    });

    expect(mockSetLoggedIn).toHaveBeenCalledWith(true);
  });

  test("shows backend error message when login fails", async () => {
    auth.login.mockRejectedValue(new Error("Login failed"));

    render(
      <MemoryRouter>
        <Login setLoggedIn={mockSetLoggedIn} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "wrong@test.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
  });

  test("shows fallback error message when login fails without backend response", async () => {
    auth.login.mockRejectedValue(new Error("Network error"));

    render(
      <MemoryRouter>
        <Login setLoggedIn={mockSetLoggedIn} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });

  test("disables submit button while submitting", async () => {
    let resolveLogin;

    auth.login.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
    );

    render(
      <MemoryRouter>
        <Login setLoggedIn={mockSetLoggedIn} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();

    resolveLogin({ accessToken: "fake-token" });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /login/i })).not.toBeDisabled();
    });
  });
});
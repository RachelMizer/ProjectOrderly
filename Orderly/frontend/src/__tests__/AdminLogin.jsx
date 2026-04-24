import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminLogin from "../pages/Admin/AdminLogin";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("AdminLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn();
    document.title = "";
    document.head.innerHTML = '<link rel="icon" href="/old.ico">';
  });

  test("sets document title and favicon on mount", () => {
    render(<AdminLogin />);

    expect(document.title).toBe("Orderly");
    expect(document.querySelector("link[rel='icon']").href).toContain("/o_favicon.ico");
  });

  test("renders login form", () => {
    render(<AdminLogin />);

    expect(screen.getByRole("heading", { name: /orderly/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  test("successful business login stores token and navigates to admin", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        accessToken: "abc123",
        customer: { role: "BUSINESS" },
      }),
    });

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/auth/login",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        })
      );
    });

    expect(localStorage.getItem("accessToken")).toBe("abc123");
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  test("shows API message when login response is not ok", async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        message: "Invalid credentials",
      }),
    });

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "badpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows non_field_errors fallback when message is missing", async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        non_field_errors: ["Unable to log in with provided credentials."],
      }),
    });

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "badpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText("Unable to log in with provided credentials.")
    ).toBeInTheDocument();
  });

  test("shows default login failed message when error body has no message", async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    });

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "badpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Login failed.")).toBeInTheDocument();
  });

  test("blocks non-business users from admin access", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        accessToken: "abc123",
        customer: { role: "CUSTOMER" },
      }),
    });

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText("This account does not have admin access.")
    ).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  test("shows network error when fetch throws", async () => {
    fetch.mockRejectedValue(new Error("Network down"));

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText("Unable to reach the server. Please try again.")
    ).toBeInTheDocument();
  });

  test("disables submit button while submitting", async () => {
    let resolveFetch;

    fetch.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    const button = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();

    resolveFetch({
      ok: true,
      json: jest.fn().mockResolvedValue({
        accessToken: "abc123",
        customer: { role: "BUSINESS" },
      }),
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });

  test("clears old error on resubmit", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: "Invalid credentials" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: "abc123",
          customer: { role: "BUSINESS" },
        }),
      });

    render(<AdminLogin />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "badpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "goodpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });

    expect(screen.queryByText("Invalid credentials")).not.toBeInTheDocument();
  });
});
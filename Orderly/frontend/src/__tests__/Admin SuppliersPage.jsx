import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminSupplierFormPage from "../pages/Admin/AdminSupplierFormPage";
import { handleApiError } from "../api/handleApiError";
import { getAuthHeaders } from "../api/auth";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../api/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

jest.mock("../api/auth", () => ({
  getAuthHeaders: jest.fn(),
}));

describe("AdminSupplierFormPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    getAuthHeaders.mockReturnValue({
      Authorization: "Bearer token",
    });
  });

  test("renders supplier form", () => {
    render(<AdminSupplierFormPage />);

    expect(screen.getByRole("heading", { name: /add new supplier/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/supplier name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contact@supplier.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add supplier/i })).toBeInTheDocument();
  });

  test("submits successfully and navigates to suppliers list", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 201,
      headers: {
        get: () => "application/json",
      },
      json: jest.fn().mockResolvedValue({ id: 1 }),
    });

    render(<AdminSupplierFormPage />);

    fireEvent.change(screen.getByPlaceholderText(/supplier name/i), {
      target: { value: "Acme Supply" },
    });
    fireEvent.change(screen.getByPlaceholderText(/contact@supplier.com/i), {
      target: { value: "acme@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/phone number/i), {
      target: { value: "555-1212" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add supplier/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/admin/suppliers",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer token",
          }),
        })
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/admin/suppliers");
  });

  test("sends null for blank email and phone", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 201,
      headers: {
        get: () => "application/json",
      },
      json: jest.fn().mockResolvedValue({ id: 1 }),
    });

    render(<AdminSupplierFormPage />);

    fireEvent.change(screen.getByPlaceholderText(/supplier name/i), {
      target: { value: "Acme Supply" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add supplier/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body).toEqual({
      name: "Acme Supply",
      email: null,
      phone: null,
    });
  });

  test("shows validation errors for 400 response with array values", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      headers: {
        get: () => "application/json",
      },
      json: jest.fn().mockResolvedValue({
        name: ["This field is required."],
        email: ["Enter a valid email."],
      }),
    });

    render(<AdminSupplierFormPage />);

    fireEvent.change(screen.getByPlaceholderText(/supplier name/i), {
      target: { value: "Bad Supplier" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add supplier/i }));

    expect(
      await screen.findByText(
        "name: This field is required. | email: Enter a valid email."
      )
    ).toBeInTheDocument();
  });

  test("shows validation errors for 400 response with string values", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      headers: {
        get: () => "application/json",
      },
      json: jest.fn().mockResolvedValue({
        detail: "Invalid payload",
      }),
    });

    render(<AdminSupplierFormPage />);

    fireEvent.change(screen.getByPlaceholderText(/supplier name/i), {
      target: { value: "Bad Supplier" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add supplier/i }));

    expect(await screen.findByText("detail: Invalid payload")).toBeInTheDocument();
  });

  test("calls handleApiError for 401 response", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      headers: {
        get: () => "application/json",
      },
      json: jest.fn().mockResolvedValue({}),
    });

    render(<AdminSupplierFormPage />);

    fireEvent.change(screen.getByPlaceholderText(/supplier name/i), {
      target: { value: "Acme Supply" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add supplier/i }));

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        expect.objectContaining({ status: 401 }),
        mockNavigate
      );
    });
  });

  test("calls handleApiError for 403 response", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 403,
      headers: {
        get: () => "application/json",
      },
      json: jest.fn().mockResolvedValue({}),
    });

    render(<AdminSupplierFormPage />);

    fireEvent.change(screen.getByPlaceholderText(/supplier name/i), {
      target: { value: "Acme Supply" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add supplier/i }));

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        expect.objectContaining({ status: 403 }),
        mockNavigate
      );
    });
  });

  test("shows generic error for non-401/403 failure", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: {
        get: () => "application/json",
      },
      json: jest.fn().mockResolvedValue({}),
    });

    render(<AdminSupplierFormPage />);

    fireEvent.change(screen.getByPlaceholderText(/supplier name/i), {
      target: { value: "Acme Supply" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add supplier/i }));

    expect(
      await screen.findByText("Failed to create supplier")
    ).toBeInTheDocument();
  });

  test("shows fallback save error when fetch throws without message", async () => {
    fetch.mockRejectedValue({});

    render(<AdminSupplierFormPage />);

    fireEvent.change(screen.getByPlaceholderText(/supplier name/i), {
      target: { value: "Acme Supply" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add supplier/i }));

    expect(
      await screen.findByText("Failed to save supplier")
    ).toBeInTheDocument();
  });

  test("disables submit button while saving", async () => {
    let resolveFetch;
    fetch.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    render(<AdminSupplierFormPage />);

    fireEvent.change(screen.getByPlaceholderText(/supplier name/i), {
      target: { value: "Acme Supply" },
    });

    const submitButton = screen.getByRole("button", { name: /add supplier/i });
    fireEvent.click(submitButton);

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();

    resolveFetch({
      ok: true,
      status: 201,
      headers: {
        get: () => "application/json",
      },
      json: jest.fn().mockResolvedValue({ id: 1 }),
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/suppliers");
    });
  });

  test("cancel button navigates back to suppliers list", () => {
    render(<AdminSupplierFormPage />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/suppliers");
  });
});
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminSuppliersPage from "../pages/Admin/AdminSuppliersPage";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../api/auth", () => ({
  getAuthHeaders: () => ({ Authorization: "Bearer fake-token" }),
}));

jest.mock("../api/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

const mockSuppliers = [
  {
    id: 1,
    name: "Fresh Farms Co",
    email: "contact@freshfarms.com",
    phone: "9195551200",
  },
  {
    id: 2,
    name: "Triangle Produce",
    email: "",
    phone: "",
  },
];

beforeEach(() => {
  jest.clearAllMocks();

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: {
      get: () => "application/json",
    },
    json: async () => ({ results: mockSuppliers }),
  });

  window.confirm = jest.fn(() => true);
});

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminSuppliersPage />
    </MemoryRouter>
  );
}

describe("AdminSuppliersPage", () => {
  test("renders loading state", () => {
    renderPage();

    expect(screen.getByText(/loading suppliers/i)).toBeInTheDocument();
  });

  test("renders supplier list", async () => {
    renderPage();

    expect(await screen.findByText(/fresh farms co/i)).toBeInTheDocument();
    expect(screen.getByText(/triangle produce/i)).toBeInTheDocument();
    expect(screen.getByText(/contact@freshfarms.com/i)).toBeInTheDocument();
    expect(screen.getByText(/919-555-1200/i)).toBeInTheDocument();
  });

  test("renders empty supplier state", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ results: [] }),
    });

    renderPage();

    expect(
      await screen.findByText(/no suppliers yet/i)
    ).toBeInTheDocument();
  });

  test("navigates to add supplier page", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: /\+ add supplier/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/admin/suppliers/new");
  });

  test("enters edit mode and cancels", async () => {
    renderPage();

    await screen.findByText(/fresh farms co/i);

    fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);

    expect(screen.getByDisplayValue("Fresh Farms Co")).toBeInTheDocument();
    expect(screen.getByDisplayValue("contact@freshfarms.com")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByDisplayValue("Fresh Farms Co")).not.toBeInTheDocument();
    expect(screen.getByText(/fresh farms co/i)).toBeInTheDocument();
  });

  test("updates supplier fields while editing", async () => {
    renderPage();

    await screen.findByText(/fresh farms co/i);

    fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);

    const nameInput = screen.getByDisplayValue("Fresh Farms Co");
    const emailInput = screen.getByDisplayValue("contact@freshfarms.com");
    const phoneInput = screen.getByDisplayValue("9195551200");

    fireEvent.change(nameInput, {
      target: { value: "Updated Supplier" },
    });

    fireEvent.change(emailInput, {
      target: { value: "updated@example.com" },
    });

    fireEvent.change(phoneInput, {
      target: { value: "9845559999" },
    });

    expect(nameInput).toHaveValue("Updated Supplier");
    expect(emailInput).toHaveValue("updated@example.com");
    expect(phoneInput).toHaveValue("9845559999");
  });

  test("saves edited supplier", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({ results: mockSuppliers }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          id: 1,
          name: "Updated Supplier",
          email: "updated@example.com",
          phone: "9845559999",
        }),
      });

    renderPage();

    await screen.findByText(/fresh farms co/i);

    fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);

    fireEvent.change(screen.getByDisplayValue("Fresh Farms Co"), {
      target: { value: "Updated Supplier" },
    });

    fireEvent.change(screen.getByDisplayValue("contact@freshfarms.com"), {
      target: { value: "updated@example.com" },
    });

    fireEvent.change(screen.getByDisplayValue("9195551200"), {
      target: { value: "9845559999" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/admin/suppliers/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            name: "Updated Supplier",
            email: "updated@example.com",
            phone: "9845559999",
          }),
        })
      );
    });

    expect(await screen.findByText(/updated supplier/i)).toBeInTheDocument();
  });

  test("shows save validation error", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({ results: mockSuppliers }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          name: ["Name is required."],
        }),
      });

    renderPage();

    await screen.findByText(/fresh farms co/i);

    fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(
      await screen.findByText(/name is required/i)
    ).toBeInTheDocument();
  });

  test("deletes supplier after confirmation", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({ results: mockSuppliers }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: {
          get: () => "",
        },
        json: async () => ({}),
      });

    renderPage();

    await screen.findByText(/fresh farms co/i);

    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8000/api/v1/admin/suppliers/1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

  });

  test("does not delete when confirmation is cancelled", async () => {
    window.confirm = jest.fn(() => false);

    renderPage();

    await screen.findByText(/fresh farms co/i);

    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/fresh farms co/i)).toBeInTheDocument();
  });

  test("shows delete error", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({ results: mockSuppliers }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({}),
      });

    renderPage();

    await screen.findByText(/fresh farms co/i);

    fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);

    expect(
      await screen.findByText(/failed to delete supplier/i)
    ).toBeInTheDocument();
  });

  test("shows load error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({}),
    });

    renderPage();

    expect(
      await screen.findByText(/failed to load suppliers/i)
    ).toBeInTheDocument();
  });

  test("shows network load error", async () => {
    fetch.mockRejectedValueOnce(new Error("Network request failed"));

    renderPage();

    expect(
      await screen.findByText(/network request failed/i)
    ).toBeInTheDocument();
  });
});
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminInventoryPage from "../pages/Admin/AdminInventoryPage";

jest.mock("../api/auth", () => ({
  getAuthHeaders: jest.fn(() => ({
    Authorization: "Bearer fake-token",
  })),
}));

global.fetch = jest.fn();

function setBusinessUser() {
  localStorage.setItem("user", JSON.stringify({ role: "BUSINESS" }));
  localStorage.setItem("accessToken", "fake-token");
}

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
        name?.toLowerCase() === "content-type" ? contentType : null,
    },
    json: async () => body,
  });
}

function setupFetch(overrides = []) {
  const oneTimeOverrides = [...overrides];

  fetch.mockImplementation((input, init = {}) => {
    const url = (typeof input === "string" ? input : input?.url) || "";
    const method = (init?.method || input?.method || "GET").toUpperCase();

    const overrideIndex = oneTimeOverrides.findIndex(
      (o) => url.includes(o.path) && method === o.method.toUpperCase()
    );

    if (overrideIndex !== -1) {
      const override = oneTimeOverrides.splice(overrideIndex, 1)[0];
      return makeResponse(override.response);
    }

    if (method === "GET" && url.includes("/admin/inventory")) {
      return makeResponse({
        status: 200,
        body: [
          {
            id: 1,
            name: "Milk",
            stock_quantity: 10,
            unit_of_measure: "l",
            reorder_level: null,
          },
          {
            id: 2,
            name: "Flour",
            stock_quantity: 5,
            unit_of_measure: "lb",
            reorder_level: null,
          },
        ],
      });
    }

    return makeResponse({
      status: 200,
      body: {},
    });
  });
}

describe("F5.3 Admin Inventory Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.alert = jest.fn();
  });

  test("loads and displays inventory sections", async () => {
    setBusinessUser();
    setupFetch();

    render(
      <MemoryRouter>
        <AdminInventoryPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: /admin inventory/i })).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", {
        name: /ingredient-controlled beverage availability/i,
      })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", {
        name: /count-based inventory items/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/^milk$/i)).toBeInTheDocument();
    expect(screen.getByText(/^flour$/i)).toBeInTheDocument();
  });

  test("updates stock and reflects immediately", async () => {
    setBusinessUser();

    setupFetch([
      {
        method: "PATCH",
        path: "/admin/inventory/1",
        response: {
          ok: true,
          status: 200,
          body: {
            id: 1,
            name: "Milk",
            stock_quantity: 0,
            unit_of_measure: "l",
            reorder_level: null,
          },
        },
      },
    ]);

    render(
      <MemoryRouter>
        <AdminInventoryPage />
      </MemoryRouter>
    );

    await screen.findByText(/^milk$/i);

    const milkName = screen.getByText(/^milk$/i);
    const milkCard = milkName.closest("div");
    const milkSection = milkCard?.parentElement;

    const stockInputs = within(milkSection).getAllByRole("spinbutton");
    fireEvent.change(stockInputs[0], { target: { value: "0" } });

    fireEvent.click(within(milkSection).getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getByText(/\(unavailable\)/i)).toBeInTheDocument();
    });
  });

  test("creates inventory item and updates UI", async () => {
    setBusinessUser();

    setupFetch([
      {
        method: "POST",
        path: "/admin/inventory",
        response: {
          ok: true,
          status: 201,
          body: {
            id: 3,
            name: "Sugar",
            stock_quantity: 10,
            unit_of_measure: "lb",
            reorder_level: null,
          },
        },
      },
    ]);

    render(
      <MemoryRouter>
        <AdminInventoryPage />
      </MemoryRouter>
    );

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.change(
      within(createSection).getByRole("textbox"),
      { target: { value: "Sugar" } }
    );

    const createNumberInputs = within(createSection).getAllByRole("spinbutton");
    fireEvent.change(createNumberInputs[0], { target: { value: "10" } });

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^create$/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/^sugar$/i)).toBeInTheDocument();
    });
  });

  test("shows validation error on invalid create", async () => {
    setBusinessUser();

    setupFetch([
      {
        method: "POST",
        path: "/admin/inventory",
        response: {
          ok: false,
          status: 400,
          body: { message: "Invalid stock value" },
        },
      },
    ]);

    render(
      <MemoryRouter>
        <AdminInventoryPage />
      </MemoryRouter>
    );

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^create$/i })
    );

    expect(
      await screen.findByText(/invalid stock value/i)
    ).toBeInTheDocument();
  });

  test("403 triggers unauthorized flow", async () => {
    setBusinessUser();

    setupFetch([
      {
        method: "GET",
        path: "/admin/inventory",
        response: {
          ok: false,
          status: 403,
          body: {},
        },
      },
    ]);

    render(
      <MemoryRouter>
        <AdminInventoryPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "You do not have permission to access this page."
      );
    });
  });
});
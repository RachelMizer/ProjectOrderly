import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminInventoryDetailPage from "../pages/Admin/AdminInventoryDetailPage";
import { fetchInventoryItem, updateInventoryItem } from "../api/adminInventory";

jest.mock("../api/adminInventory", () => ({
  fetchInventoryItem: jest.fn(),
  updateInventoryItem: jest.fn(),
}));

jest.mock("../api/auth", () => ({
  getAuthHeaders: () => ({ Authorization: "Bearer fake-token" }),
}));

jest.mock("../api/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ itemId: "1" }),
  useNavigate: () => jest.fn(),
}));

const mockInventory = {
  id: 1,
  name: "Coffee Beans",
  stock_quantity: "8",
  reorder_level: "15",
  unit_of_measure: "lb",
  supplier: {
    id: 1,
    name: "Fresh Farms Co",
    email: "orders@freshfarms.com",
    phone: "9195551200",
  },
  affected_products: ["Latte", "Cappuccino"],
};

const mockSuppliers = {
  results: [
    {
      id: 1,
      name: "Fresh Farms Co",
      email: "orders@freshfarms.com",
      phone: "9195551200",
    },
    {
      id: 2,
      name: "Triangle Produce",
      email: "orders@triangleproduce.com",
      phone: "9195551300",
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();

  fetchInventoryItem.mockResolvedValue(mockInventory);
  updateInventoryItem.mockResolvedValue(mockInventory);

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => mockSuppliers,
  });
});

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminInventoryDetailPage />
    </MemoryRouter>
  );
}

describe("AdminInventoryDetailPage", () => {
  test("renders loading state", () => {
    renderPage();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders inventory detail data", async () => {
    renderPage();

    expect(await screen.findByText(/coffee beans/i)).toBeInTheDocument();
    expect(screen.getByText(/stock details/i)).toBeInTheDocument();
    expect(
        screen.getByText(/assigned supplier/i)
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("8")).toBeInTheDocument();
    expect(screen.getByDisplayValue("15")).toBeInTheDocument();
  });

  test("shows low stock badge", async () => {
    renderPage();

    expect(
    await screen.findByText(/low stock/i)
    ).toBeInTheDocument();
    });

  test("renders affected products section", async () => {
    renderPage();

    expect(await screen.findByText(/used in products/i)).toBeInTheDocument();
    expect(screen.getByText(/latte/i)).toBeInTheDocument();
    expect(screen.getByText(/cappuccino/i)).toBeInTheDocument();
  });

  test("renders supplier contact details", async () => {
    renderPage();

    expect(await screen.findByText(/orders@freshfarms.com/i)).toBeInTheDocument();
    expect(
        screen.getByText(/919-555-1200/i)
    ).toBeInTheDocument();
  });

  test("updates stock quantity field", async () => {
    renderPage();

    const stockInput = await screen.findByDisplayValue("8");

    fireEvent.change(stockInput, {
      target: { value: "20" },
    });

    expect(stockInput).toHaveValue(20);
  });

  test("updates reorder level field", async () => {
    renderPage();

    const reorderInput = await screen.findByDisplayValue("15");

    fireEvent.change(reorderInput, {
      target: { value: "25" },
    });

    expect(reorderInput).toHaveValue(25);
  });

  test("updates unit of measure select", async () => {
    renderPage();

    await screen.findByText(/coffee beans/i);

    const selects = screen.getAllByRole("combobox");
    const unitSelect = selects[0];

    fireEvent.change(unitSelect, {
      target: { value: "units" },
    });

    expect(unitSelect).toHaveValue("units");
  });

  test("saves stock updates", async () => {
    updateInventoryItem.mockResolvedValueOnce({
      ...mockInventory,
      stock_quantity: "20",
    });

    renderPage();

    const stockInput = await screen.findByDisplayValue("8");

    fireEvent.change(stockInput, {
      target: { value: "20" },
    });

    fireEvent.click(screen.getAllByRole("button", { name: /save/i })[0]);

    await waitFor(() => {
      expect(updateInventoryItem).toHaveBeenCalledWith("1", {
        stock_quantity: 20,
        unit_of_measure: "lb",
        reorder_level: 15,
      });
    });

    expect(await screen.findByText(/saved/i)).toBeInTheDocument();
  });

  test("shows stock save error", async () => {
    updateInventoryItem.mockRejectedValueOnce(new Error("Failed to save stock"));

    renderPage();

    const stockInput = await screen.findByDisplayValue("8");

    fireEvent.change(stockInput, {
      target: { value: "22" },
    });

    fireEvent.click(screen.getAllByRole("button", { name: /save/i })[0]);

    expect(await screen.findByText(/failed to save stock/i)).toBeInTheDocument();
  });

  test("changes assigned supplier and saves", async () => {
    updateInventoryItem.mockResolvedValueOnce({
      ...mockInventory,
      supplier: mockSuppliers.results[1],
    });

    renderPage();

    await screen.findByText(/coffee beans/i);

    const selects = screen.getAllByRole("combobox");
    const supplierSelect = selects[1];

    fireEvent.change(supplierSelect, {
      target: { value: "2" },
    });

    fireEvent.click(screen.getAllByRole("button", { name: /save/i })[1]);

    await waitFor(() => {
      expect(updateInventoryItem).toHaveBeenCalledWith("1", {
        supplier_id: 2,
      });
    });

    expect(await screen.findByText(/saved/i)).toBeInTheDocument();
  });

  test("shows supplier save error", async () => {
    updateInventoryItem.mockRejectedValueOnce(new Error("Failed to save supplier"));

    renderPage();

    await screen.findByText(/coffee beans/i);

    const supplierSelect = screen.getAllByRole("combobox")[1];

    fireEvent.change(supplierSelect, {
      target: { value: "2" },
    });

    fireEvent.click(screen.getAllByRole("button", { name: /save/i })[1]);

    expect(
      await screen.findByText(/failed to save supplier/i)
    ).toBeInTheDocument();
  });

  test("navigates back to inventory", async () => {
    renderPage();

    const backButton = await screen.findByRole("button", {
      name: /back to inventory/i,
    });

    fireEvent.click(backButton);

    expect(backButton).toBeInTheDocument();
  });

  test("shows api error state", async () => {
    fetchInventoryItem.mockRejectedValueOnce(new Error("Network request failed"));

    renderPage();

    expect(await screen.findByText(/network request failed/i)).toBeInTheDocument();
  });

  test("handles suppliers fetch failure with empty supplier list", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ results: [] }),
    });

    renderPage();

    expect(await screen.findByText(/coffee beans/i)).toBeInTheDocument();
    expect(screen.getByText(/assigned supplier/i)).toBeInTheDocument();
  });
});
import "@testing-library/jest-dom";
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminInventoryPage from "../pages/Admin/AdminInventoryPage";
import {
  fetchInventory,
  updateInventoryItem,
  createInventoryItem,
} from "../api/adminInventory";
import { handleApiError } from "../api/handleApiError";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock("../api/adminInventory", () => ({
  fetchInventory: jest.fn(),
  updateInventoryItem: jest.fn(),
  createInventoryItem: jest.fn(),
}));

jest.mock("../api/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

const baseInventory = [
  {
    id: 1,
    name: "Milk",
    stock_quantity: 30,
    unit_of_measure: "l",
    reorder_level: 12,
    affected_products: ["Latte", "Cappuccino", "Mocha"],
  },
  {
    id: 2,
    name: "Oat Milk",
    stock_quantity: 16,
    unit_of_measure: "l",
    reorder_level: 6,
    affected_products: ["Latte", "Chai Tea Latte"],
  },
  {
    id: 3,
    name: "Cups (12oz)",
    stock_quantity: 300,
    unit_of_measure: "units",
    reorder_level: 120,
    affected_products: [],
  },
  {
    id: 4,
    name: "Cake Pop",
    stock_quantity: 0,
    unit_of_measure: "units",
    reorder_level: 5,
    affected_products: [],
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminInventoryPage />
    </MemoryRouter>
  );
}

async function openCreatePanel() {
  fireEvent.click(screen.getByRole("button", { name: /\+ add item/i }));
  return await screen.findByText(/new inventory item/i);
}

function getCreatePanel() {
  return screen.getByText(/new inventory item/i).closest(".inv-create-panel");
}

describe("AdminInventoryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    fetchInventory.mockResolvedValue(baseInventory);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("renders ingredient-controlled and count-based sections with inventory split correctly", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { name: /supply inventory/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /supply inventory/i })).toBeInTheDocument();

    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Oat Milk")).toBeInTheDocument();
    expect(screen.getByText("Cups (12oz)")).toBeInTheDocument();
    expect(screen.getByText("Cake Pop")).toBeInTheDocument();

    expect(screen.getByText("Latte, Cappuccino, Mocha")).toBeInTheDocument();
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  test("filters both tables from the shared search bar", async () => {
    renderPage();

    await screen.findByText("Milk");

    fireEvent.change(screen.getByPlaceholderText(/search inventory/i), {
      target: { value: "milk" },
    });

    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText("Oat Milk")).toBeInTheDocument();
    expect(screen.queryByText("Cups (12oz)")).not.toBeInTheDocument();
    expect(screen.queryByText("Cake Pop")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/search inventory/i), {
      target: { value: "cups" },
    });

    expect(screen.getByText("Cups (12oz)")).toBeInTheDocument();
    expect(screen.queryByText("Milk")).not.toBeInTheDocument();
    expect(screen.queryByText("Oat Milk")).not.toBeInTheDocument();
  });

  test("allows inline editing and saving for ingredient items", async () => {
    updateInventoryItem.mockResolvedValue({
      id: 1,
      name: "Milk",
      stock_quantity: 22,
      unit_of_measure: "l",
      reorder_level: 10,
      affected_products: ["Latte", "Cappuccino", "Mocha"],
    });

    renderPage();

    await screen.findByText("Milk");

    const milkRow = screen.getByText("Milk").closest("tr");
    const inputs = within(milkRow).getAllByRole("spinbutton");

    fireEvent.change(inputs[0], { target: { value: "22" } });
    fireEvent.change(inputs[1], { target: { value: "10" } });

    fireEvent.click(within(milkRow).getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(updateInventoryItem).toHaveBeenCalledWith(1, {
        stock_quantity: 22,
        reorder_level: 10,
      });
    });

    expect(await within(milkRow).findByText("Saved!")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2600);
    });

    await waitFor(() => {
      expect(
        within(milkRow).getByRole("button", { name: /save/i })
      ).toBeInTheDocument();
    });
  });

  test("toggling an available ingredient off immediately patches stock to 0 and reorder level to null", async () => {
    updateInventoryItem.mockResolvedValue({
      id: 1,
      name: "Milk",
      stock_quantity: 0,
      unit_of_measure: "l",
      reorder_level: null,
      affected_products: ["Latte", "Cappuccino", "Mocha"],
    });

    renderPage();

    const toggle = await screen.findByRole("checkbox", {
      name: /toggle milk availability/i,
    });

    expect(toggle).toBeChecked();

    fireEvent.click(toggle);

    await waitFor(() => {
      expect(updateInventoryItem).toHaveBeenCalledWith(1, {
        stock_quantity: 0,
        reorder_level: null,
      });
    });

    expect(await screen.findByText(/out of stock/i)).toBeInTheDocument();
  });

  test("toggling an unavailable ingredient on prompts for quantity entry instead of saving immediately", async () => {
    fetchInventory.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock_quantity: 0,
        unit_of_measure: "l",
        reorder_level: null,
        affected_products: ["Latte", "Cappuccino", "Mocha"],
      },
    ]);

    renderPage();

    const toggle = await screen.findByRole("checkbox", {
      name: /toggle milk availability/i,
    });

    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);

    expect(screen.getByText(/enter qty & save/i)).toBeInTheDocument();

    const row = screen.getByLabelText(/toggle milk availability/i).closest("tr");
    const stockInput = within(row).getAllByRole("spinbutton")[0];

    expect(stockInput).toHaveClass("inv-qty-input--activate");
    expect(updateInventoryItem).not.toHaveBeenCalled();
  });

  test("applies invalid input styling for negative inline values", async () => {
    renderPage();

    await screen.findByText("Milk");

    const milkRow = screen.getByText("Milk").closest("tr");
    const inputs = within(milkRow).getAllByRole("spinbutton");

    fireEvent.change(inputs[0], { target: { value: "-1" } });
    fireEvent.change(inputs[1], { target: { value: "-5" } });

    expect(inputs[0]).toHaveClass("inv-input-error");
    expect(inputs[1]).toHaveClass("inv-input-error");
  });

  test("opens create panel, creates a new item, and shows create success feedback", async () => {
    createInventoryItem.mockResolvedValue({
      id: 99,
      name: "Brownies",
      stock_quantity: 8,
      unit_of_measure: "units",
      reorder_level: 2,
      affected_products: [],
    });

    renderPage();
    await screen.findByText("Milk");
    await openCreatePanel();

    const createPanel = getCreatePanel();

    fireEvent.change(within(createPanel).getByPlaceholderText(/item name/i), {
      target: { value: "Brownies" },
    });

    const createInputs = within(createPanel).getAllByRole("spinbutton");
    fireEvent.change(createInputs[0], { target: { value: "8" } });
    fireEvent.change(createInputs[1], { target: { value: "2" } });

    fireEvent.click(within(createPanel).getByRole("button", { name: /^create$/i }));

    await waitFor(() => {
      expect(createInventoryItem).toHaveBeenCalledWith({
        name: "Brownies",
        stock_quantity: 8,
        unit_of_measure: "units",
        reorder_level: 2,
      });
    });

    expect(
      await screen.findByText(/item created successfully/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Brownies")).toBeInTheDocument();
  });

  test("cancel create hides panel and resets values when reopened", async () => {
    renderPage();
    await screen.findByText("Milk");
    await openCreatePanel();

    let createPanel = getCreatePanel();

    fireEvent.change(within(createPanel).getByPlaceholderText(/item name/i), {
      target: { value: "Temp Item" },
    });

    fireEvent.click(within(createPanel).getByRole("button", { name: /^cancel$/i }));

    await waitFor(() => {
      expect(screen.queryByText(/new inventory item/i)).not.toBeInTheDocument();
    });

    await openCreatePanel();
    createPanel = getCreatePanel();

    expect(within(createPanel).getByPlaceholderText(/item name/i)).toHaveValue("");
  });

  test("applies invalid input styling for negative create form values", async () => {
    renderPage();
    await screen.findByText("Milk");
    await openCreatePanel();

    const createPanel = getCreatePanel();
    const createInputs = within(createPanel).getAllByRole("spinbutton");

    fireEvent.change(createInputs[0], { target: { value: "-3" } });
    fireEvent.change(createInputs[1], { target: { value: "-1" } });

    expect(createInputs[0]).toHaveClass("inv-input-error");
    expect(createInputs[1]).toHaveClass("inv-input-error");
  });

  test("shows backend validation messages on save failure", async () => {
    updateInventoryItem.mockRejectedValue({
      response: {
        status: 400,
        data: {
          reorder_level: ["Reorder level cannot exceed stock quantity."],
        },
      },
    });

    renderPage();

    await screen.findByText("Milk");

    const milkRow = screen.getByText("Milk").closest("tr");
    fireEvent.click(within(milkRow).getByRole("button", { name: /save/i }));

    expect(
      await screen.findByText(/reorder level cannot exceed stock quantity/i)
    ).toBeInTheDocument();
  });

  test("shows backend validation messages on create failure", async () => {
    createInventoryItem.mockRejectedValue({
      response: {
        status: 400,
        data: {
          name: ["name is required"],
        },
      },
    });

    renderPage();
    await screen.findByText("Milk");
    await openCreatePanel();

    const createPanel = getCreatePanel();
    fireEvent.click(within(createPanel).getByRole("button", { name: /^create$/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  test("create sends nulls for blank numeric values", async () => {
    createInventoryItem.mockResolvedValue({
      id: 100,
      name: "Napkins",
      stock_quantity: null,
      unit_of_measure: "units",
      reorder_level: null,
      affected_products: [],
    });

    renderPage();
    await screen.findByText("Milk");
    await openCreatePanel();

    const createPanel = getCreatePanel();

    fireEvent.change(within(createPanel).getByPlaceholderText(/item name/i), {
      target: { value: "Napkins" },
    });

    fireEvent.click(within(createPanel).getByRole("button", { name: /^create$/i }));

    await waitFor(() => {
      expect(createInventoryItem).toHaveBeenCalledWith({
        name: "Napkins",
        stock_quantity: null,
        unit_of_measure: "units",
        reorder_level: null,
      });
    });
  });

  test("shows load error when inventory fetch fails with non-403 error", async () => {
    fetchInventory.mockRejectedValue(new Error("Unable to load inventory"));

    renderPage();

    expect(
      await screen.findByText(/unable to load inventory/i)
    ).toBeInTheDocument();
  });

  test("delegates 403 load errors to handleApiError", async () => {
    const error403 = {
      response: {
        status: 403,
        data: { message: "Forbidden" },
      },
    };

    fetchInventory.mockRejectedValue(error403);

    renderPage();

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(error403, mockNavigate);
    });
  });

  test("delegates 403 create errors to handleApiError", async () => {
    const error403 = {
      response: {
        status: 403,
        data: { message: "Forbidden" },
      },
    };

    createInventoryItem.mockRejectedValue(error403);

    renderPage();
    await screen.findByText("Milk");
    await openCreatePanel();

    const createPanel = getCreatePanel();
    fireEvent.click(within(createPanel).getByRole("button", { name: /^create$/i }));

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(error403, mockNavigate);
    });
  });

  test("sorts ingredient table by stock quantity when header is clicked", async () => {
    fetchInventory.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock_quantity: 30,
        unit_of_measure: "l",
        reorder_level: 12,
        affected_products: ["Latte"],
      },
      {
        id: 2,
        name: "Vanilla Syrup",
        stock_quantity: 10,
        unit_of_measure: "l",
        reorder_level: 4,
        affected_products: ["Latte"],
      },
      {
        id: 3,
        name: "Cups (12oz)",
        stock_quantity: 300,
        unit_of_measure: "units",
        reorder_level: 120,
        affected_products: [],
      },
    ]);

    renderPage();

    await screen.findByText("Milk");

    const tables = screen.getAllByRole("table");
    const ingredientTable = tables[0];

    const stockHeader = within(ingredientTable).getByRole("columnheader", {
      name: /current stock/i,
    });

    fireEvent.click(stockHeader);

    const rows = within(ingredientTable).getAllByRole("row");

    expect(within(rows[1]).getByText("Vanilla Syrup")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Milk")).toBeInTheDocument();
  });
});
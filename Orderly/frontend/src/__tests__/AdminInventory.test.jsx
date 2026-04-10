import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminInventoryPage from "../pages/Admin/AdminInventoryPage";

const mockNavigate = jest.fn();
const mockHandleApiError = jest.fn();
const mockFetchInventory = jest.fn();
const mockCreateInventoryItem = jest.fn();
const mockUpdateInventoryItem = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../api/adminInventory", () => ({
  fetchInventory: (...args) => mockFetchInventory(...args),
  createInventoryItem: (...args) => mockCreateInventoryItem(...args),
  updateInventoryItem: (...args) => mockUpdateInventoryItem(...args),
}));

jest.mock("../api/handleApiError", () => ({
  handleApiError: (...args) => mockHandleApiError(...args),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminInventoryPage />
    </MemoryRouter>
  );
}

function inventoryData(items) {
  return items;
}

describe("AdminInventoryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading state first", async () => {
    mockFetchInventory.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText(/loading inventory/i)).toBeInTheDocument();
  });

  test("renders both inventory sections with items", async () => {
    mockFetchInventory.mockResolvedValue(
      inventoryData([
        {
          id: 1,
          name: "Milk",
          stock_quantity: 10,
          reorder_level: 2,
          unit_of_measure: "l",
        },
        {
          id: 2,
          name: "Flour",
          stock_quantity: 5,
          reorder_level: 1,
          unit_of_measure: "lb",
        },
      ])
    );

    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: /ingredient-controlled beverage availability/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /count-based inventory items/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/^milk$/i)).toBeInTheDocument();
    expect(screen.getByText(/^flour$/i)).toBeInTheDocument();
    expect(screen.getByText(/affects: latte, cappuccino, mocha/i)).toBeInTheDocument();
  });

  test("shows generic load error", async () => {
    mockFetchInventory.mockRejectedValue(new Error("Unable to load inventory"));

    renderPage();

    expect(
      await screen.findByText(/unable to load inventory/i)
    ).toBeInTheDocument();
  });

  test("403 on load calls unauthorized handler", async () => {
    mockFetchInventory.mockRejectedValue({
      response: { status: 403 },
    });

    renderPage();

    await waitFor(() => {
      expect(mockHandleApiError).toHaveBeenCalled();
    });
  });

  test("shows empty state for ingredient section", async () => {
    mockFetchInventory.mockResolvedValue(
      inventoryData([
        {
          id: 2,
          name: "Flour",
          stock_quantity: 5,
          reorder_level: 1,
          unit_of_measure: "lb",
        },
      ])
    );

    renderPage();

    expect(
      await screen.findByText(/no dependency-controlled ingredients found/i)
    ).toBeInTheDocument();
  });

  test("shows empty state for count-based section", async () => {
    mockFetchInventory.mockResolvedValue(
      inventoryData([
        {
          id: 1,
          name: "Milk",
          stock_quantity: 10,
          reorder_level: 2,
          unit_of_measure: "l",
        },
      ])
    );

    renderPage();

    expect(
      await screen.findByText(/no count-based inventory items found/i)
    ).toBeInTheDocument();
  });

  test("updates ingredient stock and reflects unavailable state immediately", async () => {
    mockFetchInventory.mockResolvedValue(
      inventoryData([
        {
          id: 1,
          name: "Milk",
          stock_quantity: 10,
          reorder_level: 2,
          unit_of_measure: "l",
        },
      ])
    );

    mockUpdateInventoryItem.mockResolvedValue({
      id: 1,
      name: "Milk",
      stock_quantity: 0,
      reorder_level: 0,
      unit_of_measure: "l",
    });

    renderPage();

    await screen.findByText(/^milk$/i);

    const milkRow = screen.getByText(/^milk$/i).closest("div").parentElement;
    const inputs = within(milkRow).getAllByRole("spinbutton");

    fireEvent.change(inputs[0], { target: { value: "0" } });
    fireEvent.change(inputs[1], { target: { value: "0" } });

    fireEvent.click(within(milkRow).getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getByText(/\(unavailable\)/i)).toBeInTheDocument();
    });

    expect(mockUpdateInventoryItem).toHaveBeenCalledWith(1, {
      stock_quantity: 0,
      reorder_level: 0,
    });
  });

  test("shows out of stock badge for count-based item", async () => {
    mockFetchInventory.mockResolvedValue(
      inventoryData([
        {
          id: 2,
          name: "Flour",
          stock_quantity: 0,
          reorder_level: 0,
          unit_of_measure: "lb",
        },
      ])
    );

    renderPage();

    expect(await screen.findByText(/\(out of stock\)/i)).toBeInTheDocument();
  });

  test("creates inventory item and updates UI", async () => {
    mockFetchInventory.mockResolvedValue(
      inventoryData([
        {
          id: 1,
          name: "Milk",
          stock_quantity: 10,
          reorder_level: 2,
          unit_of_measure: "l",
        },
      ])
    );

    mockCreateInventoryItem.mockResolvedValue({
      id: 3,
      name: "Brownies",
      stock_quantity: 5,
      reorder_level: 2,
      unit_of_measure: "units",
    });

    renderPage();

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.change(within(createSection).getByRole("textbox"), {
      target: { value: "Brownies" },
    });

    const createInputs = within(createSection).getAllByRole("spinbutton");
    fireEvent.change(createInputs[0], { target: { value: "5" } });
    fireEvent.change(createInputs[1], { target: { value: "2" } });

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^create$/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/^brownies$/i)).toBeInTheDocument();
    });

    expect(mockCreateInventoryItem).toHaveBeenCalledWith({
      name: "Brownies",
      stock_quantity: 5,
      unit_of_measure: "units",
      reorder_level: 2,
    });
  });

  test("cancel create resets form", async () => {
    mockFetchInventory.mockResolvedValue([]);

    renderPage();

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.change(within(createSection).getByRole("textbox"), {
      target: { value: "Temp Item" },
    });

    const createInputs = within(createSection).getAllByRole("spinbutton");
    fireEvent.change(createInputs[0], { target: { value: "7" } });
    fireEvent.change(createInputs[1], { target: { value: "3" } });

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^cancel$/i })
    );

    expect(within(createSection).getByRole("textbox")).toHaveValue("");
    expect(createInputs[0]).toHaveValue(null);
    expect(createInputs[1]).toHaveValue(null);
  });

  test("create error uses name validation message", async () => {
    mockFetchInventory.mockResolvedValue([]);
    mockCreateInventoryItem.mockRejectedValue({
      response: { data: { name: ["Name already exists"] } },
    });

    renderPage();

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^create$/i })
    );

    expect(await screen.findByText(/name already exists/i)).toBeInTheDocument();
  });

  test("create error uses stock_quantity validation message", async () => {
    mockFetchInventory.mockResolvedValue([]);
    mockCreateInventoryItem.mockRejectedValue({
      response: { data: { stock_quantity: ["Stock must be positive"] } },
    });

    renderPage();

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^create$/i })
    );

    expect(await screen.findByText(/stock must be positive/i)).toBeInTheDocument();
  });

  test("create error uses reorder_level validation message", async () => {
    mockFetchInventory.mockResolvedValue([]);
    mockCreateInventoryItem.mockRejectedValue({
      response: { data: { reorder_level: ["Reorder level invalid"] } },
    });

    renderPage();

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^create$/i })
    );

    expect(await screen.findByText(/reorder level invalid/i)).toBeInTheDocument();
  });

  test("create error uses unit_of_measure validation message", async () => {
    mockFetchInventory.mockResolvedValue([]);
    mockCreateInventoryItem.mockRejectedValue({
      response: { data: { unit_of_measure: ["Invalid unit"] } },
    });

    renderPage();

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^create$/i })
    );

    expect(await screen.findByText(/invalid unit/i)).toBeInTheDocument();
  });

  test("create error uses non_field_errors", async () => {
    mockFetchInventory.mockResolvedValue([]);
    mockCreateInventoryItem.mockRejectedValue({
      response: { data: { non_field_errors: ["General validation error"] } },
    });

    renderPage();

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^create$/i })
    );

    expect(
      await screen.findByText(/general validation error/i)
    ).toBeInTheDocument();
  });

  test("create error uses backend message", async () => {
    mockFetchInventory.mockResolvedValue([]);
    mockCreateInventoryItem.mockRejectedValue({
      response: { data: { message: "Create failed" } },
    });

    renderPage();

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^create$/i })
    );

    expect(await screen.findByText(/create failed/i)).toBeInTheDocument();
  });

  test("create error uses backend detail", async () => {
    mockFetchInventory.mockResolvedValue([]);
    mockCreateInventoryItem.mockRejectedValue({
      response: { data: { detail: "Detail error" } },
    });

    renderPage();

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^create$/i })
    );

    expect(await screen.findByText(/detail error/i)).toBeInTheDocument();
  });

  test("create error falls back to default message", async () => {
    mockFetchInventory.mockResolvedValue([]);
    mockCreateInventoryItem.mockRejectedValue({
      response: { data: {} },
    });

    renderPage();

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^create$/i })
    );

    expect(
      await screen.findByText(/unable to create inventory item/i)
    ).toBeInTheDocument();
  });

  test("403 on create calls unauthorized handler", async () => {
    mockFetchInventory.mockResolvedValue([]);
    mockCreateInventoryItem.mockRejectedValue({
      response: { status: 403 },
    });

    renderPage();

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^create$/i })
    );

    await waitFor(() => {
      expect(mockHandleApiError).toHaveBeenCalled();
    });
  });

  test("save error uses stock_quantity validation message", async () => {
    mockFetchInventory.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock_quantity: 10,
        reorder_level: 2,
        unit_of_measure: "l",
      },
    ]);

    mockUpdateInventoryItem.mockRejectedValue({
      response: { data: { stock_quantity: ["Stock invalid"] } },
    });

    renderPage();

    await screen.findByText(/^milk$/i);
    const milkRow = screen.getByText(/^milk$/i).closest("div").parentElement;

    fireEvent.click(within(milkRow).getByRole("button", { name: /^save$/i }));

    expect(await screen.findByText(/stock invalid/i)).toBeInTheDocument();
  });

  test("save error uses reorder_level validation message", async () => {
    mockFetchInventory.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock_quantity: 10,
        reorder_level: 2,
        unit_of_measure: "l",
      },
    ]);

    mockUpdateInventoryItem.mockRejectedValue({
      response: { data: { reorder_level: ["Reorder invalid"] } },
    });

    renderPage();

    await screen.findByText(/^milk$/i);
    const milkRow = screen.getByText(/^milk$/i).closest("div").parentElement;

    fireEvent.click(within(milkRow).getByRole("button", { name: /^save$/i }));

    expect(await screen.findByText(/reorder invalid/i)).toBeInTheDocument();
  });

  test("save error uses non_field_errors", async () => {
    mockFetchInventory.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock_quantity: 10,
        reorder_level: 2,
        unit_of_measure: "l",
      },
    ]);

    mockUpdateInventoryItem.mockRejectedValue({
      response: { data: { non_field_errors: ["General save error"] } },
    });

    renderPage();

    await screen.findByText(/^milk$/i);
    const milkRow = screen.getByText(/^milk$/i).closest("div").parentElement;

    fireEvent.click(within(milkRow).getByRole("button", { name: /^save$/i }));

    expect(await screen.findByText(/general save error/i)).toBeInTheDocument();
  });

  test("save error uses raw string response", async () => {
    mockFetchInventory.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock_quantity: 10,
        reorder_level: 2,
        unit_of_measure: "l",
      },
    ]);

    mockUpdateInventoryItem.mockRejectedValue({
      response: { data: "String backend error" },
    });

    renderPage();

    await screen.findByText(/^milk$/i);
    const milkRow = screen.getByText(/^milk$/i).closest("div").parentElement;

    fireEvent.click(within(milkRow).getByRole("button", { name: /^save$/i }));

    expect(await screen.findByText(/string backend error/i)).toBeInTheDocument();
  });

  test("save error uses backend message", async () => {
    mockFetchInventory.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock_quantity: 10,
        reorder_level: 2,
        unit_of_measure: "l",
      },
    ]);

    mockUpdateInventoryItem.mockRejectedValue({
      response: { data: { message: "Save failed" } },
    });

    renderPage();

    await screen.findByText(/^milk$/i);
    const milkRow = screen.getByText(/^milk$/i).closest("div").parentElement;

    fireEvent.click(within(milkRow).getByRole("button", { name: /^save$/i }));

    expect(await screen.findByText(/save failed/i)).toBeInTheDocument();
  });

  test("save error uses backend detail", async () => {
    mockFetchInventory.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock_quantity: 10,
        reorder_level: 2,
        unit_of_measure: "l",
      },
    ]);

    mockUpdateInventoryItem.mockRejectedValue({
      response: { data: { detail: "Save detail error" } },
    });

    renderPage();

    await screen.findByText(/^milk$/i);
    const milkRow = screen.getByText(/^milk$/i).closest("div").parentElement;

    fireEvent.click(within(milkRow).getByRole("button", { name: /^save$/i }));

    expect(await screen.findByText(/save detail error/i)).toBeInTheDocument();
  });

  test("save error falls back to default message", async () => {
    mockFetchInventory.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock_quantity: 10,
        reorder_level: 2,
        unit_of_measure: "l",
      },
    ]);

    mockUpdateInventoryItem.mockRejectedValue({
      response: { data: {} },
    });

    renderPage();

    await screen.findByText(/^milk$/i);
    const milkRow = screen.getByText(/^milk$/i).closest("div").parentElement;

    fireEvent.click(within(milkRow).getByRole("button", { name: /^save$/i }));

    expect(
      await screen.findByText(/unable to save inventory item/i)
    ).toBeInTheDocument();
  });

  test("403 on save calls unauthorized handler", async () => {
    mockFetchInventory.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock_quantity: 10,
        reorder_level: 2,
        unit_of_measure: "l",
      },
    ]);

    mockUpdateInventoryItem.mockRejectedValue({
      response: { status: 403 },
    });

    renderPage();

    await screen.findByText(/^milk$/i);
    const milkRow = screen.getByText(/^milk$/i).closest("div").parentElement;

    fireEvent.click(within(milkRow).getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(mockHandleApiError).toHaveBeenCalled();
    });
  });

  test("save sends nulls for blank edited values", async () => {
    mockFetchInventory.mockResolvedValue([
      {
        id: 1,
        name: "Milk",
        stock_quantity: 10,
        reorder_level: 2,
        unit_of_measure: "l",
      },
    ]);

    mockUpdateInventoryItem.mockResolvedValue({
      id: 1,
      name: "Milk",
      stock_quantity: null,
      reorder_level: null,
      unit_of_measure: "l",
    });

    renderPage();

    await screen.findByText(/^milk$/i);
    const milkRow = screen.getByText(/^milk$/i).closest("div").parentElement;
    const inputs = within(milkRow).getAllByRole("spinbutton");

    fireEvent.change(inputs[0], { target: { value: "" } });
    fireEvent.change(inputs[1], { target: { value: "" } });

    fireEvent.click(within(milkRow).getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      expect(mockUpdateInventoryItem).toHaveBeenCalledWith(1, {
        stock_quantity: null,
        reorder_level: null,
      });
    });
  });

  test("create sends nulls for blank numeric values", async () => {
    mockFetchInventory.mockResolvedValue([]);
    mockCreateInventoryItem.mockResolvedValue({
      id: 5,
      name: "Tea Bags",
      stock_quantity: null,
      reorder_level: null,
      unit_of_measure: "units",
    });

    renderPage();

    const createHeading = await screen.findByRole("heading", {
      name: /create inventory item/i,
    });
    const createSection = createHeading.closest("section");

    fireEvent.change(within(createSection).getByRole("textbox"), {
      target: { value: "Tea Bags" },
    });

    fireEvent.click(
      within(createSection).getByRole("button", { name: /^create$/i })
    );

    await waitFor(() => {
      expect(mockCreateInventoryItem).toHaveBeenCalledWith({
        name: "Tea Bags",
        stock_quantity: null,
        unit_of_measure: "units",
        reorder_level: null,
      });
    });
  });
});
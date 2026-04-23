import {
  fetchInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../api/adminInventory";

global.fetch = jest.fn();

const createMockResponse = (data, ok = true, status = 200) => ({
  ok,
  status,
  headers: {
    get: (key) => (key === "content-type" ? "application/json" : null),
  },
  json: jest.fn().mockResolvedValue(data),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("adminInventory API", () => {
  test("fetchInventory returns array directly", async () => {
    fetch.mockResolvedValue(createMockResponse([{ id: 1 }]));

    const result = await fetchInventory();

    expect(result).toEqual([{ id: 1 }]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("fetchInventory returns data.results", async () => {
    fetch.mockResolvedValue(createMockResponse({ results: [{ id: 2 }] }));

    const result = await fetchInventory();

    expect(result).toEqual([{ id: 2 }]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("fetchInventory returns empty array fallback", async () => {
    fetch.mockResolvedValue(createMockResponse({ something: "else" }));

    const result = await fetchInventory();

    expect(result).toEqual([]);
  });

  test("fetchInventory throws error on failure", async () => {
    fetch.mockResolvedValue(
      createMockResponse({ message: "fail" }, false, 500)
    );

    await expect(fetchInventory()).rejects.toThrow("fail");
  });

  test("createInventoryItem success", async () => {
    fetch.mockResolvedValue(createMockResponse({ id: 1 }));

    const result = await createInventoryItem({ name: "item" });

    expect(result).toEqual({ id: 1 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("createInventoryItem failure", async () => {
    fetch.mockResolvedValue(
      createMockResponse({ message: "error" }, false, 400)
    );

    await expect(createInventoryItem({})).rejects.toThrow("error");
  });

  test("updateInventoryItem success", async () => {
    fetch.mockResolvedValue(createMockResponse({ updated: true }));

    const result = await updateInventoryItem(1, {});

    expect(result).toEqual({ updated: true });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("deleteInventoryItem success", async () => {
    fetch.mockResolvedValue({
      ok: true,
    });

    const result = await deleteInventoryItem(1);

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("deleteInventoryItem failure", async () => {
    fetch.mockResolvedValue(
      createMockResponse({ message: "delete failed" }, false, 400)
    );

    await expect(deleteInventoryItem(1)).rejects.toThrow("delete failed");
  });
});
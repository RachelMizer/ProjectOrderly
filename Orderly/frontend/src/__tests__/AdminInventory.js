import {
  fetchInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  fetchInventoryItem,
  fetchLowStock,
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

  test("fetchInventory handles non-json response", async () => {
fetch.mockResolvedValue({
ok:true,
status:200,
headers:{
get:()=> "text/html"
}
});

const result = await fetchInventory();

expect(result).toEqual([]);
});


test("fetchInventory handles bad json parse", async () => {
fetch.mockResolvedValue({
ok:true,
status:200,
headers:{
get:()=> "application/json"
},
json: jest.fn().mockRejectedValue(
new Error("bad json")
)
});

const result = await fetchInventory();

expect(result).toEqual([]);
});


test("fetchInventory uses detail fallback in errors", async () => {
fetch.mockResolvedValue(
createMockResponse(
{detail:"detail failure"},
false,
500
)
);

await expect(
fetchInventory()
).rejects.toThrow("detail failure");
});


test("createInventoryItem uses default error message fallback", async () => {
fetch.mockResolvedValue(
createMockResponse(
{},
false,
500
)
);

await expect(
createInventoryItem({})
).rejects.toThrow(
"Failed to create inventory item."
);
});


test("updateInventoryItem failure branch", async () => {
fetch.mockResolvedValue(
createMockResponse(
{message:"update failed"},
false,
400
)
);

await expect(
updateInventoryItem(1,{})
).rejects.toThrow(
"update failed"
);
});


test("fetchLowStock success", async () => {
fetch.mockResolvedValue(
createMockResponse([
{id:1,stock:2}
])
);

const result = await fetchLowStock();

expect(result).toEqual([
{id:1,stock:2}
]);
});


test("fetchLowStock error branch", async () => {
fetch.mockResolvedValue(
createMockResponse(
{message:"low stock failed"},
false,
500
)
);

await expect(
fetchLowStock()
).rejects.toThrow(
"low stock failed"
);
});


test("fetchInventoryItem success", async () => {
fetch.mockResolvedValue(
createMockResponse({
id:44,
name:"Milk"
})
);

const result = await fetchInventoryItem(44);

expect(result).toEqual({
id:44,
name:"Milk"
});
});


test("fetchInventoryItem failure", async () => {
fetch.mockResolvedValue(
createMockResponse(
{message:"not found"},
false,
404
)
);

await expect(
fetchInventoryItem(44)
).rejects.toThrow(
"not found"
);
});


test("deleteInventoryItem default error fallback", async () => {
fetch.mockResolvedValue({
ok:false,
status:500,
headers:{
get:()=> "application/json"
},
json:jest.fn().mockResolvedValue({})
});

await expect(
deleteInventoryItem(1)
).rejects.toThrow(
"Failed to delete inventory item."
);
});
});
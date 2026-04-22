import { pushRecentOrder } from "../utils/recentOrders";

const KEY = "orderly_recent_orders";

describe("recentOrders utility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("stores a recent order in localStorage", () => {
    pushRecentOrder({
      id: 1,
      customerFirstName: "Kenny",
      customerLastName: "Bacdayan",
    });

    const result = JSON.parse(localStorage.getItem(KEY));

    expect(result).toEqual([
      { id: 1, customerName: "Kenny Bacdayan" },
    ]);
  });

  test("stores null customerName when no first or last name exists", () => {
    pushRecentOrder({
      id: 2,
    });

    const result = JSON.parse(localStorage.getItem(KEY));

    expect(result).toEqual([
      { id: 2, customerName: null },
    ]);
  });

  test("keeps only the 5 most recent orders", () => {
    for (let i = 1; i <= 7; i++) {
      pushRecentOrder({
        id: i,
        customerFirstName: `First${i}`,
        customerLastName: `Last${i}`,
      });
    }

    const result = JSON.parse(localStorage.getItem(KEY));

    expect(result).toHaveLength(5);
    expect(result.map((o) => o.id)).toEqual([7, 6, 5, 4, 3]);
  });

  test("moves duplicate order id to the front instead of duplicating it", () => {
    pushRecentOrder({
      id: 1,
      customerFirstName: "Old",
      customerLastName: "Name",
    });

    pushRecentOrder({
      id: 2,
      customerFirstName: "Second",
      customerLastName: "User",
    });

    pushRecentOrder({
      id: 1,
      customerFirstName: "New",
      customerLastName: "Name",
    });

    const result = JSON.parse(localStorage.getItem(KEY));

    expect(result).toEqual([
      { id: 1, customerName: "New Name" },
      { id: 2, customerName: "Second User" },
    ]);
  });

  test("handles partial names correctly", () => {
    pushRecentOrder({
      id: 3,
      customerFirstName: "OnlyFirst",
    });

    pushRecentOrder({
      id: 4,
      customerLastName: "OnlyLast",
    });

    const result = JSON.parse(localStorage.getItem(KEY));

    expect(result).toEqual([
      { id: 4, customerName: "OnlyLast" },
      { id: 3, customerName: "OnlyFirst" },
    ]);
  });
});
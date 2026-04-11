import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProductPage from "../pages/ProductPage";

jest.mock("../api/orders", () => ({
  getGuestCartEmail: jest.fn(() => "guest@test.com"),
}));

global.crypto = {
  randomUUID: () => "test-uuid",
};

global.fetch = jest.fn();

const mockProduct = {
  results: [{ id: 1, name: "Latte", description: "Coffee" }],
};

const mockVariants = {
  results: [
    { id: 101, name: "Small", unitPrice: 4.0, stockQuantity: 10 },
    { id: 102, name: "Large", unitPrice: 6.0, stockQuantity: 0 },
  ],
};

const mockCheckboxModifiers = {
  groups: [
    {
      id: 1,
      name: "Extras",
      required: false,
      minSelections: 0,
      maxSelections: 2,
      options: [
        { id: 201, name: "Shot", priceAdjustment: "1.00" },
        { id: 202, name: "Oat Milk", priceAdjustment: "0.50" },
        { id: 203, name: "Caramel", priceAdjustment: "0.75" },
      ],
    },
  ],
};

const mockRadioModifiers = {
  groups: [
    {
      id: 2,
      name: "Milk",
      required: true,
      minSelections: 1,
      maxSelections: 1,
      options: [
        { id: 301, name: "Whole", priceAdjustment: "0.00" },
        { id: 302, name: "Almond", priceAdjustment: "0.75" },
      ],
    },
  ],
};

function renderPage(route = "/product/1") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<div>Cart Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProductPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders loading state first", () => {
    fetch.mockImplementation(() => new Promise(() => {}));

    renderPage();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders product name and description", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/products/1/variants/101/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCheckboxModifiers),
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVariants),
        });
      }

      if (url.includes("/products") && !url.includes("/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderPage();

    expect(await screen.findByText("Latte")).toBeInTheDocument();
    expect(screen.getByText("Coffee")).toBeInTheDocument();
  });

  test("shows product not found when product id does not exist", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/products") && !url.includes("/variants")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              results: [{ id: 99, name: "Tea" }],
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({ results: [] }),
      });
    });

    renderPage("/product/1");

    expect(await screen.findByText(/product not found/i)).toBeInTheDocument();
  });

  test("handles product load error and logs it", async () => {
    fetch.mockRejectedValue(new Error("boom"));

    renderPage();

    expect(await screen.findByText(/product not found/i)).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
  });

  test("selects variant and updates price", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/products/1/variants/101/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCheckboxModifiers),
        });
      }

      if (url.includes("/products/1/variants/102/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCheckboxModifiers),
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVariants),
        });
      }

      if (url.includes("/products") && !url.includes("/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderPage();

    await screen.findByText("Latte");

    fireEvent.click(await screen.findByLabelText(/large/i));

    await waitFor(() => {
      expect(screen.getByText("$6.00")).toBeInTheDocument();
    });
  });

  test("shows out of stock and hides add to cart when selected variant has zero stock", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/products/1/variants/101/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCheckboxModifiers),
        });
      }

      if (url.includes("/products/1/variants/102/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCheckboxModifiers),
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVariants),
        });
      }

      if (url.includes("/products") && !url.includes("/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderPage();

    await screen.findByText("Latte");
    fireEvent.click(await screen.findByLabelText(/large/i));

    await waitFor(() => {
      expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /add to cart/i })
    ).not.toBeInTheDocument();
  });

  test("renders checkbox modifiers and updates total price when selected", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/products/1/variants/101/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCheckboxModifiers),
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVariants),
        });
      }

      if (url.includes("/products") && !url.includes("/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderPage();

    await screen.findByText("Latte");
    const shot = await screen.findByLabelText(/shot/i);

    fireEvent.click(shot);

    await waitFor(() => {
      expect(screen.getByText("$5.00")).toBeInTheDocument();
    });
  });

  test("checkbox modifier can be deselected", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/products/1/variants/101/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCheckboxModifiers),
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVariants),
        });
      }

      if (url.includes("/products") && !url.includes("/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderPage();

    await screen.findByText("Latte");
    const shot = await screen.findByLabelText(/shot/i);

    fireEvent.click(shot);
    await waitFor(() => {
      expect(screen.getByText("$5.00")).toBeInTheDocument();
    });

    fireEvent.click(shot);
    await waitFor(() => {
      expect(screen.getByText("$4.00")).toBeInTheDocument();
    });
  });

  test("disables extra checkbox options after reaching max selections", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/products/1/variants/101/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCheckboxModifiers),
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVariants),
        });
      }

      if (url.includes("/products") && !url.includes("/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderPage();

    await screen.findByText("Latte");

    const shot = await screen.findByLabelText(/shot/i);
    const oat = await screen.findByLabelText(/oat milk/i);
    const caramel = await screen.findByLabelText(/caramel/i);

    fireEvent.click(shot);
    fireEvent.click(oat);

    await waitFor(() => {
      expect(caramel).toBeDisabled();
    });
  });

  test("radio modifiers replace previous selection when maxSelections is 1", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/products/1/variants/101/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRadioModifiers),
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVariants),
        });
      }

      if (url.includes("/products") && !url.includes("/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderPage();

    await screen.findByText("Latte");

    const whole = await screen.findByLabelText(/whole/i);
    const almond = await screen.findByLabelText(/almond/i);

    fireEvent.click(whole);
    expect(whole).toBeChecked();

    fireEvent.click(almond);
    expect(almond).toBeChecked();
    expect(whole).not.toBeChecked();
  });

  test("shows choose exact count text when minSelections equals maxSelections", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/products/1/variants/101/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRadioModifiers),
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVariants),
        });
      }

      if (url.includes("/products") && !url.includes("/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderPage();

    await screen.findByText("Latte");
    expect(await screen.findByText(/choose 1/i)).toBeInTheDocument();
  });

  test("preselects edit-mode variant and modifiers from query params", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/products/1/variants/101/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCheckboxModifiers),
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVariants),
        });
      }

      if (url.includes("/products") && !url.includes("/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderPage("/product/1?editItem=55&variantId=101&modifiers=201,202");

    await screen.findByText("Latte");

    const small = await screen.findByLabelText(/small/i);
    const shot = await screen.findByLabelText(/shot/i);
    const oat = await screen.findByLabelText(/oat milk/i);

    expect(small).toBeChecked();
    expect(shot).toBeChecked();
    expect(oat).toBeChecked();
    expect(
      screen.getByRole("button", { name: /update item/i })
    ).toBeInTheDocument();
  });

  test("calls add to cart flow for new item and navigates to cart", async () => {
    fetch.mockImplementation((url, options) => {
      if (url.includes("/products/1/variants/101/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCheckboxModifiers),
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVariants),
        });
      }

      if (url.includes("/products") && !url.includes("/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });
      }

      if (url.includes("/orders/draft")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 999 }),
        });
      }

      if (url.includes("/orders/items") && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ orderItemId: 555 }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderPage();

    await screen.findByText("Latte");

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    await waitFor(() => {
      const urls = fetch.mock.calls.map((call) => call[0]);
      expect(urls.some((url) => url.includes("/orders/draft"))).toBe(true);
      expect(urls.some((url) => url.includes("/orders/items"))).toBe(true);
    });

    expect(await screen.findByText(/cart page/i)).toBeInTheDocument();
  });

  test("edit mode patches old item before adding updated item", async () => {
    fetch.mockImplementation((url, options) => {
        if (url.includes("/products/1/variants/101/modifiers")) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockCheckboxModifiers),
        });
        }

        if (url.includes("/products/1/variants")) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockVariants),
        });
        }

        if (url.includes("/products") && !url.includes("/variants")) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockProduct),
        });
        }

        if (url.includes("/orders/items/55") && options?.method === "PATCH") {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({}),
        });
        }

        if (url.includes("/orders/draft")) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: 999 }),
        });
        }

        if (url.includes("/orders/items/777/modifiers")) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({}),
        });
        }

        if (url.includes("/orders/items") && options?.method === "POST") {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ orderItemId: 777 }),
        });
        }

        return Promise.resolve({
        ok: true,
        json: async () => ({}),
        });
    });

    renderPage("/product/1?editItem=55&variantId=101&modifiers=201,202");

    await screen.findByText("Latte");

    // Wait until edit-mode preselected modifiers are actually loaded into state
    const shot = await screen.findByLabelText(/shot/i);
    const oat = await screen.findByLabelText(/oat milk/i);

    await waitFor(() => {
        expect(shot).toBeChecked();
        expect(oat).toBeChecked();
    });

    fireEvent.click(screen.getByRole("button", { name: /update item/i }));

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/orders/items/55",
        expect.objectContaining({
            method: "PATCH",
        })
        );
    });

    await waitFor(() => {
        const urls = fetch.mock.calls.map((call) => call[0]);
        expect(urls.some((url) => url.includes("/orders/items/777/modifiers"))).toBe(true);
    });

    expect(await screen.findByText(/cart page/i)).toBeInTheDocument();
    });

  test("logs add-to-cart errors without crashing", async () => {
    fetch.mockImplementation((url) => {
      if (url.includes("/products/1/variants/101/modifiers")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCheckboxModifiers),
        });
      }

      if (url.includes("/products/1/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockVariants),
        });
      }

      if (url.includes("/products") && !url.includes("/variants")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });
      }

      if (url.includes("/orders/draft")) {
        return Promise.reject(new Error("cart error"));
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    renderPage();

    await screen.findByText("Latte");
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
});
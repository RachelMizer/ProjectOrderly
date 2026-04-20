import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StoreFront from "../pages/StoreFront";

const mockProducts = [
  {
    id: 1,
    name: "Latte",
    price: "4.50",
    imageUrl: "/media/products/latte.png",
    isAvailable: true,
    categoryId: 1,
  },
  {
    id: 2,
    name: "Blueberry Muffin",
    price: "3.25",
    imageUrl: "/media/products/muffin.png",
    isAvailable: true,
    categoryId: 2,
  },
];

const mockCategories = [
  { id: 1, name: "Beverages" },
  { id: 2, name: "Food" },
];

describe("StoreFront product images", () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      const requestUrl = String(url);

      if (requestUrl.includes("/products")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ results: mockProducts }),
        });
      }

      if (requestUrl.includes("/categories")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ results: mockCategories }),
        });
      }

      return Promise.reject(new Error(`Unhandled fetch: ${requestUrl}`));
    });
  });

  function renderStoreFront() {
    return render(
      <MemoryRouter>
        <StoreFront />
      </MemoryRouter>
    );
  }

  test("renders product images when imageUrl is present", async () => {
    renderStoreFront();

    const latteHeading = await screen.findByRole("heading", { name: /latte/i });
    const muffinHeading = await screen.findByRole("heading", { name: /blueberry muffin/i });

    const latteCard = latteHeading.closest(".product-card");
    const muffinCard = muffinHeading.closest(".product-card");

    const latteImg = within(latteCard).getByRole("img");
    const muffinImg = within(muffinCard).getByRole("img");

    expect(latteImg).toHaveAttribute("src", expect.stringContaining("/media/products/"));
    expect(muffinImg).toHaveAttribute("src", expect.stringContaining("/media/products/"));
  });

  test("does not render placeholder when imageUrl exists", async () => {
    renderStoreFront();

    const latteHeading = await screen.findByRole("heading", { name: /latte/i });
    const latteCard = latteHeading.closest(".product-card");

    expect(
      within(latteCard).queryByText(/placeholder/i)
    ).not.toBeInTheDocument();
  });

  test("renders placeholder when imageUrl is missing", async () => {
    global.fetch = jest.fn((url) => {
      const requestUrl = String(url);

      if (requestUrl.includes("/products")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            results: [
              {
                id: 3,
                name: "House Coffee",
                price: "2.95",
                imageUrl: null,
                isAvailable: true,
                categoryId: 1,
              },
            ],
          }),
        });
      }

      if (requestUrl.includes("/categories")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ results: mockCategories }),
        });
      }

      return Promise.reject(new Error(`Unhandled fetch: ${requestUrl}`));
    });

    renderStoreFront();

    const coffeeHeading = await screen.findByRole("heading", { name: /house coffee/i });
    const coffeeCard = coffeeHeading.closest(".product-card");

    expect(within(coffeeCard).queryByRole("img")).not.toBeInTheDocument();
  });
});
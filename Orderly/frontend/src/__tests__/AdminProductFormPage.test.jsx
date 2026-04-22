import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminProductFormPage from "../pages/Admin/AdminProductFormPage";
import { handleApiError } from "../api/handleApiError";
import { getAuthHeaders } from "../api/auth";

const mockNavigate = jest.fn();
let mockProductId;

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ productId: mockProductId }),
}));

jest.mock("../api/handleApiError", () => ({
  handleApiError: jest.fn(),
}));

jest.mock("../api/auth", () => ({
  getAuthHeaders: jest.fn(),
}));

describe("AdminProductFormPage", () => {
  const categories = {
    results: [
      { id: 1, name: "Coffee" },
      { id: 2, name: "Tea" },
    ],
  };

  const suppliers = {
    results: [
      { id: 10, name: "Acme Supply" },
      { id: 11, name: "Bean Bros" },
    ],
  };

  const product = {
    id: 99,
    name: "Latte",
    category: { id: 1 },
    supplier: { id: 10 },
    description: "Test latte",
    has_variants: true,
    has_modifiers: false,
    imageUrl: "http://example.com/latte.png",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockProductId = undefined;
    global.fetch = jest.fn();
    global.URL.createObjectURL = jest.fn(() => "blob:preview-url");
    getAuthHeaders.mockReturnValue({
      Authorization: "Bearer token",
    });
  });

  function getProductNameInput() {
    return screen.getAllByPlaceholderText(/product name/i)[0];
  }

  function getVariantNameInput() {
    return screen.getByPlaceholderText(
      /e\.g\. small, 12oz, default/i
    );
  }

  function getFileInput() {
    return document.querySelector('input[type="file"][name="image"]');
  }

  function getComboboxes() {
    return screen.getAllByRole("combobox");
  }

  test("renders create form after loading categories and suppliers", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      });

    render(<AdminProductFormPage />);

    expect(await screen.findByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("Acme Supply")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create product/i })).toBeInTheDocument();
  });

  test("loads existing product data in edit mode", async () => {
    mockProductId = "99";

    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(product),
      });

    render(<AdminProductFormPage />);

    expect(await screen.findByDisplayValue("Latte")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test latte")).toBeInTheDocument();
    expect(screen.getByAltText(/product preview/i)).toBeInTheDocument();

    const selects = getComboboxes();
    expect(selects[0]).toHaveValue("1");
    expect(selects[1]).toHaveValue("10");
  });

  test("handles file input change and shows image preview", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      });

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    const file = new File(["img"], "photo.png", { type: "image/png" });
    const input = getFileInput();

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByAltText(/product preview/i)).toHaveAttribute(
      "src",
      "blob:preview-url"
    );
  });

  test("remove image clears preview", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      });

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    const file = new File(["img"], "photo.png", { type: "image/png" });
    const input = getFileInput();

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(screen.getByAltText(/product preview/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /remove image/i }));

    expect(screen.queryByAltText(/product preview/i)).not.toBeInTheDocument();
  });

  test("checkboxes toggle has_variants and has_modifiers", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      });

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    const variantsCheckbox = screen.getByLabelText(/has variants/i);
    const modifiersCheckbox = screen.getByLabelText(/has modifiers/i);

    expect(variantsCheckbox).toBeChecked();
    expect(modifiersCheckbox).not.toBeChecked();

    fireEvent.click(variantsCheckbox);
    fireEvent.click(modifiersCheckbox);

    expect(variantsCheckbox).not.toBeChecked();
    expect(modifiersCheckbox).toBeChecked();
  });

  test("updates variant inputs in create mode", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      });

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    fireEvent.change(screen.getByPlaceholderText("SKU"), {
      target: { value: "LATTE-001" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "5.99" },
    });
    fireEvent.change(screen.getByPlaceholderText(/leave blank if not tracked/i), {
      target: { value: "10" },
    });
    fireEvent.change(getVariantNameInput(), {
      target: { value: "Large" },
    });

    expect(screen.getByDisplayValue("LATTE-001")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5.99")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Large")).toBeInTheDocument();
  });

  test("shows validation message from response.message", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValue({
          message: "Validation failed",
        }),
      });

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    fireEvent.change(getProductNameInput(), {
      target: { value: "Latte" },
    });

    const selects = getComboboxes();
    fireEvent.change(selects[0], { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    expect(await screen.findByText("Validation failed")).toBeInTheDocument();
  });

  test("shows combined validation messages for object response", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValue({
          name: ["This field is required."],
          category: "Choose a category.",
        }),
      });

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    fireEvent.change(getProductNameInput(), {
      target: { value: "Latte" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    expect(
      await screen.findByText(
        "name: This field is required. | category: Choose a category."
      )
    ).toBeInTheDocument();
  });

  test("falls back to generic validation error for empty object", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValue({}),
      });

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    expect(await screen.findByText("Validation error")).toBeInTheDocument();
  });

  test("successful create navigates to admin catalog", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValue({ id: 123 }),
      });

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    fireEvent.change(getProductNameInput(), {
      target: { value: "Latte" },
    });

    const selects = getComboboxes();
    fireEvent.change(selects[0], { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/catalog");
    });
  });

  test("successful create with variant fields filled also creates first variant", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValue({ id: 123 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValue({ id: 456 }),
      });

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    fireEvent.change(getProductNameInput(), {
      target: { value: "Latte" },
    });

    const selects = getComboboxes();
    fireEvent.change(selects[0], { target: { value: "1" } });

    fireEvent.change(screen.getByPlaceholderText("SKU"), {
      target: { value: "LATTE-001" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "5.99" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(4);
    });

    expect(fetch.mock.calls[3][0]).toContain("/admin/products/123/variants");
    expect(mockNavigate).toHaveBeenCalledWith("/admin/catalog");
  });

  test("calls handleApiError when loadPageData gets 401 in edit mode", async () => {
    mockProductId = "99";

    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValue({}),
      });

    render(<AdminProductFormPage />);

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        expect.objectContaining({ status: 401 }),
        mockNavigate
      );
    });
  });

  test("shows non-auth loadPageData error message", async () => {
    mockProductId = "99";

    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValue({}),
      });

    render(<AdminProductFormPage />);

    expect(await screen.findByText("Failed to load product")).toBeInTheDocument();
  });

  test("shows load product error when edit fetch throws with message", async () => {
    mockProductId = "99";

    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockRejectedValueOnce(new Error("Boom load error"));

    render(<AdminProductFormPage />);

    expect(await screen.findByText("Boom load error")).toBeInTheDocument();
  });

  test("calls handleApiError on submit 403", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValue({}),
      });

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    fireEvent.change(getProductNameInput(), {
      target: { value: "Latte" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => {
      expect(handleApiError).toHaveBeenCalledWith(
        expect.objectContaining({ status: 403 }),
        mockNavigate
      );
    });
  });

  test("shows fallback save error when submit throws without message", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockRejectedValueOnce({});

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    expect(await screen.findByText("Failed to save product")).toBeInTheDocument();
  });

  test("shows submit error message when save throws with message", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockRejectedValueOnce(new Error("Boom save error"));

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    expect(await screen.findByText("Boom save error")).toBeInTheDocument();
  });

  test("shows updating state in edit mode while saving", async () => {
    mockProductId = "99";

    let resolveSubmit;

    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(product),
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSubmit = resolve;
          })
      );

    render(<AdminProductFormPage />);

    expect(await screen.findByDisplayValue("Latte")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /update product/i }));

    expect(screen.getByRole("button", { name: /updating/i })).toBeDisabled();

    resolveSubmit({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: jest.fn().mockResolvedValue({ id: 99 }),
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/catalog");
    });
  });

  test("successful update in edit mode navigates to admin catalog", async () => {
    mockProductId = "99";

    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(product),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValue({ id: 99 }),
      });

    render(<AdminProductFormPage />);

    expect(await screen.findByDisplayValue("Latte")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /update product/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/catalog");
    });
  });

  test("variant creation 400 uses buildValidationMessage", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValue({ id: 123 }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: { get: () => "application/json" },
        json: jest.fn().mockResolvedValue({
          sku: ["Already exists"],
        }),
      });

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    fireEvent.change(getProductNameInput(), {
      target: { value: "Latte" },
    });

    const selects = getComboboxes();
    fireEvent.change(selects[0], { target: { value: "1" } });

    fireEvent.change(screen.getByPlaceholderText("SKU"), {
      target: { value: "LATTE-001" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "5.99" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    expect(await screen.findByText("sku: Already exists")).toBeInTheDocument();
  });

  test("cancel button navigates back to catalog", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(categories),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(suppliers),
      });

    render(<AdminProductFormPage />);

    await screen.findByText("Coffee");

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/catalog");
  });
});
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminStorefrontSettings from "../pages/Admin/AdminStorefrontSettings";

const mockSettings = {
  storeTagline: "Your pause, perfected.",
  showTagline: true,
  storePhone: "9195550123",
  storeAddress: "123 Main St\nRaleigh, NC 27601",
  hours: "Mon-Fri: 7am-6pm",
  fontChoice: "arimo",
  pageBackgroundColor: "#ffffff",
  headerSpecialTextColor: "#111111",
  headerTextColor: "#333333",
  navBgColor: "#222222",
  navLinkColor: "#ffffff",
  navTextColor: "#ffffff",
  mainLinkColor: "#555555",
  mainTextColor: "#333333",
  footerBgColor: "#222222",
  footerLinkColor: "#ffffff",
  footerTextColor: "#dddddd",
  btnBgColor: "#eeeeee",
  btnTextColor: "#333333",
  sectionBg1Color: "#f5f0e8",
  sectionBg2Color: "#e8f0f5",
  storeImage: "logo.png",
  favicon: "favicon.png",
};

const mockCategories = {
  results: [
    { id: 1, name: "Coffee", icon: "☕" },
    { id: 2, name: "Tea", icon: "" },
  ],
};

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("accessToken", "fake-token");

  global.fetch = jest.fn((url, options = {}) => {
    if (String(url).includes("/admin/categories/") && options.method === "PATCH") {
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    }

    if (String(url).includes("/admin/categories")) {
      return Promise.resolve({
        ok: true,
        json: async () => mockCategories,
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => mockSettings,
    });
  });
});

describe("AdminStorefrontSettings", () => {
  test("renders loading state", () => {
    render(<AdminStorefrontSettings />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("loads and renders storefront settings", async () => {
    render(<AdminStorefrontSettings />);

    expect(
      await screen.findByText(/branding and storefront management/i)
    ).toBeInTheDocument();

    expect(screen.getByDisplayValue("Your pause, perfected.")).toBeInTheDocument();
    expect(screen.getByLabelText(/store phone/i)).toHaveValue("9195550123");
    expect(screen.getByLabelText(/store address/i)).toHaveValue(
      "123 Main St\nRaleigh, NC 27601"
    );
    expect(screen.getByLabelText(/hours/i)).toHaveValue("Mon-Fri: 7am-6pm");
  });

  test("renders current logo and favicon previews", async () => {
    render(<AdminStorefrontSettings />);

    expect(await screen.findByAltText(/business logo/i)).toBeInTheDocument();
    expect(screen.getByAltText(/favicon/i)).toBeInTheDocument();
  });

  test("updates tagline and shows unsaved changes", async () => {
    render(<AdminStorefrontSettings />);

    const tagline = await screen.findByDisplayValue("Your pause, perfected.");

    fireEvent.change(tagline, {
      target: { value: "Fresh coffee daily." },
    });

    expect(tagline).toHaveValue("Fresh coffee daily.");
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });

  test("toggles display tagline checkbox", async () => {
    render(<AdminStorefrontSettings />);

    const checkbox = await screen.findByRole("checkbox", {
      name: /display tagline on storefront/i,
    });

    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });

  test("updates location and hours fields", async () => {
    render(<AdminStorefrontSettings />);

    const address = await screen.findByLabelText(/store address/i);
    const phone = screen.getByLabelText(/store phone/i);
    const hours = screen.getByLabelText(/hours/i);

    fireEvent.change(address, {
      target: { value: "456 New St\nRaleigh, NC" },
    });

    fireEvent.change(phone, {
      target: { value: "9195559999" },
    });

    fireEvent.change(hours, {
      target: { value: "Sat-Sun: 8am-4pm" },
    });

    expect(address).toHaveValue("456 New St\nRaleigh, NC");
    expect(phone).toHaveValue("9195559999");
    expect(hours).toHaveValue("Sat-Sun: 8am-4pm");
  });

  test("changes font choice", async () => {
    render(<AdminStorefrontSettings />);

    await screen.findByText(/font choice/i);

    const loraRadio = screen.getByRole("radio", { name: /lora/i });

    fireEvent.click(loraRadio);

    expect(loraRadio).toBeChecked();
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });

  test("updates color picker and hex input", async () => {
    render(<AdminStorefrontSettings />);

    await screen.findByText(/page style color choices/i);

    const colorInputs = screen.getAllByDisplayValue("#ffffff");
    const firstColorInput = colorInputs[0];

    fireEvent.change(firstColorInput, {
      target: {
        name: "pageBackgroundColor",
        value: "#123456",
      },
    });

    expect(firstColorInput).toHaveValue("#123456");
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });

  test("handles valid hex input without hash", async () => {
    render(<AdminStorefrontSettings />);

    await screen.findByText(/page style color choices/i);

    const hexInputs = screen.getAllByPlaceholderText(/#000000/i);
    const firstHex = hexInputs[0];

    fireEvent.change(firstHex, {
      target: { value: "abcdef" },
    });

    fireEvent.blur(firstHex);

    expect(firstHex).toHaveValue("#abcdef");
  });

  test("resets invalid hex input on blur", async () => {
    render(<AdminStorefrontSettings />);

    await screen.findByText(/page style color choices/i);

    const hexInputs = screen.getAllByPlaceholderText(/#000000/i);
    const firstHex = hexInputs[0];

    fireEvent.change(firstHex, {
      target: { value: "bad" },
    });

    fireEvent.blur(firstHex);

    expect(firstHex).toHaveValue("#ffffff");
  });

  test("handles logo and favicon file uploads", async () => {
    render(<AdminStorefrontSettings />);

    await screen.findByText(/branding and storefront management/i);

    const logoFile = new File(["logo"], "logo.png", { type: "image/png" });
    const faviconFile = new File(["favicon"], "favicon.png", {
      type: "image/png",
    });

    fireEvent.change(screen.getByLabelText(/business logo/i), {
      target: { files: [logoFile] },
    });

    fireEvent.change(screen.getByLabelText(/browser tab icon/i), {
      target: { files: [faviconFile] },
    });

    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });

  test("saves storefront settings successfully", async () => {
    render(<AdminStorefrontSettings />);

    const tagline = await screen.findByDisplayValue("Your pause, perfected.");

    fireEvent.change(tagline, {
      target: { value: "Updated tagline" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save settings/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/settings/",
        expect.objectContaining({
          method: "PATCH",
          body: expect.any(FormData),
        })
      );
    });

    expect(await screen.findByText(/settings saved/i)).toBeInTheDocument();
  });

  test("shows save error when settings update fails", async () => {
    fetch.mockImplementation((url, options = {}) => {
      if (String(url).includes("/admin/categories")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCategories,
        });
      }

      if (options.method === "PATCH") {
        return Promise.resolve({
          ok: false,
          json: async () => ({}),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => mockSettings,
      });
    });

    render(<AdminStorefrontSettings />);

    const tagline = await screen.findByDisplayValue("Your pause, perfected.");

    fireEvent.change(tagline, {
      target: { value: "Broken save" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save settings/i }));

    expect(
      await screen.findByText(/failed to save settings/i)
    ).toBeInTheDocument();
  });

  test("renders categories and removes existing icon", async () => {
    render(<AdminStorefrontSettings />);

    expect(await screen.findByText(/coffee/i)).toBeInTheDocument();
    expect(screen.getByText(/tea/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /remove icon/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/admin/categories/1",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });
  });

  test("opens emoji picker and selects an icon", async () => {
    render(<AdminStorefrontSettings />);

    expect(await screen.findByText(/tea/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /pick icon/i }));

    fireEvent.click(screen.getByRole("button", { name: "Food" }));

    const appleEmojiButton = screen.getByRole("button", { name: "🍎" });

    fireEvent.click(appleEmojiButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/v1/admin/categories/2",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });
  });

  test("shows empty category message when categories fail", async () => {
    fetch.mockImplementation((url) => {
      if (String(url).includes("/admin/categories")) {
        return Promise.resolve({
          ok: false,
          json: async () => ({}),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => mockSettings,
      });
    });

    render(<AdminStorefrontSettings />);

    expect(await screen.findByText(/no categories found/i)).toBeInTheDocument();
  });

  test("uses cached storefront settings when available", async () => {
    localStorage.setItem(
      "settings_storefront",
      JSON.stringify({
        ...mockSettings,
        storeTagline: "Cached tagline",
      })
    );

    render(<AdminStorefrontSettings />);

    expect(screen.getByDisplayValue("Cached tagline")).toBeInTheDocument();
  });

  test("handles bad cached settings without crashing", async () => {
    localStorage.setItem("settings_storefront", "{bad json");

    render(<AdminStorefrontSettings />);

    expect(
      await screen.findByText(/branding and storefront management/i)
    ).toBeInTheDocument();
  });

  test("handles favicon preview error", async () => {
    render(<AdminStorefrontSettings />);

    const favicon = await screen.findByAltText(/favicon/i);

    fireEvent.error(favicon);

    expect(screen.getByText(/favicon uploaded/i)).toBeInTheDocument();
  });
});
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminBusinessSettings from "../pages/Admin/AdminBusinessSettings";

const mockSettings = {
  storeName: "Quick Sip Cafe",
  taxRate: "8.00",
  contactPhone: "7045550192",
  contactEmail: "hello@quicksipcafe.com",
  hqAddress: "201 W Main St. Raleigh, NC 27601",
};

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("accessToken", "fake-token");
  global.fetch = jest.fn();
});

describe("AdminBusinessSettings", () => {
  test("renders loading state", () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSettings,
    });

    render(
      <MemoryRouter>
        <AdminBusinessSettings />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("loads and renders business settings form", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSettings,
    });

    render(
      <MemoryRouter>
        <AdminBusinessSettings />
      </MemoryRouter>
    );

    expect(await screen.findByText(/business settings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business name/i)).toHaveValue("Quick Sip Cafe");
    expect(screen.getByLabelText(/tax rate/i)).toHaveValue(8);
    expect(screen.getByLabelText(/phone number/i)).toHaveValue("7045550192");
    expect(screen.getByLabelText(/email/i)).toHaveValue("hello@quicksipcafe.com");
    expect(screen.getByLabelText(/address/i)).toHaveValue("201 W Main St. Raleigh, NC 27601");
  });

  test("shows unsaved changes when form is edited", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSettings,
    });

    render(
      <MemoryRouter>
        <AdminBusinessSettings />
      </MemoryRouter>
    );

    const businessName = await screen.findByLabelText(/business name/i);

    fireEvent.change(businessName, {
      target: { value: "Updated Cafe" },
    });

    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });

  test("saves updated business settings", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockSettings,
          storeName: "Updated Cafe",
        }),
      });

    render(
      <MemoryRouter>
        <AdminBusinessSettings />
      </MemoryRouter>
    );

    const businessName = await screen.findByLabelText(/business name/i);

    fireEvent.change(businessName, {
      target: { value: "Updated Cafe" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save settings/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/api/v1/settings/`,
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    expect(await screen.findByText(/settings saved/i)).toBeInTheDocument();
  });

  test("shows error message when save fails", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    render(
      <MemoryRouter>
        <AdminBusinessSettings />
      </MemoryRouter>
    );

    const phone = await screen.findByLabelText(/phone number/i);

    fireEvent.change(phone, {
      target: { value: "9195551234" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save settings/i }));

    expect(
      await screen.findByText(/failed to save settings/i)
    ).toBeInTheDocument();
  });

  test("loads cached settings from localStorage", async () => {
    localStorage.setItem("settings_business", JSON.stringify(mockSettings));

    fetch.mockRejectedValueOnce(new Error("Network failed"));

    render(
      <MemoryRouter>
        <AdminBusinessSettings />
      </MemoryRouter>
    );

    expect(screen.getByText(/business settings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business name/i)).toHaveValue("Quick Sip Cafe");
  });

  test("handles bad cached settings without crashing", async () => {
    localStorage.setItem("settings_business", "{bad json");

    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSettings,
    });

    render(
        <MemoryRouter>
        <AdminBusinessSettings />
        </MemoryRouter>
    );

    expect(
        await screen.findByText(/business settings/i)
    ).toBeInTheDocument();

    expect(
        screen.getByRole("button", {
        name: /save settings/i
        })
    ).toBeInTheDocument();
    });
});
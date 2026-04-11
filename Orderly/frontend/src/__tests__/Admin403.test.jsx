import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminProductsPage from "../pages/Admin/AdminProductsPage";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Admin 403 handling", () => {
  let alertSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  test("shows alert and redirects home on backend 403", async () => {
    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "You do not have permission to access this page."
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
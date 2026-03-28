import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResetPassword from "../pages/ResetPassword";
import * as auth from "../api/auth";

jest.mock("../api/auth");

describe("ResetPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={["/reset-password?uid=abc123&token=xyz123"]}>
        <ResetPassword />
      </MemoryRouter>
    );
  }

  test("renders reset form", () => {
    renderPage();

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  test("calls API on submit", async () => {
    auth.confirmPasswordReset.mockResolvedValue({});

    renderPage();

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "newpassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(auth.confirmPasswordReset).toHaveBeenCalled();
    });
  });
});
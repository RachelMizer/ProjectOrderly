import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPasswordRequest from "../pages/ResetPasswordRequest";
import * as auth from "../api/auth";

jest.mock("../api/auth");

describe("Password Reset Request", () => {
  test("renders form", () => {
    render(<ResetPasswordRequest />);

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  test("calls reset request API", async () => {
    auth.requestPasswordReset.mockResolvedValue({});

    render(<ResetPasswordRequest />);

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "test@test.com" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /send reset link/i })
    );

    await waitFor(() => {
      expect(auth.requestPasswordReset).toHaveBeenCalled();
    });
  });
});
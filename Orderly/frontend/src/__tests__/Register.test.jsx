import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/Auth/Register";
import * as auth from "../api/auth";
import "@testing-library/jest-dom";
jest.mock("../api/auth");

describe("Register Page", () => {
  test("renders register form", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  test("calls register API", async () => {
    auth.register.mockResolvedValue({
      accessToken: "token",
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });

    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "test@test.com" },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(auth.register).toHaveBeenCalled();
    });
  });
});